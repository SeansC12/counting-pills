import { useRef, useEffect, useState } from "react";
import PillProgressCard from "./components/PillProgressCard";
import AlertCard from "./components/AlertCard";
import PillCountChangeKeypad from "./components/Keypad";
import PulsingBorder from "./components/PulsingBorder";
import Webcam from "react-webcam";
import { cn } from "./lib/utils";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [pillCount, setPillCount] = useState(5);
  const [damagedPillCount, setDamagedPillCount] =
    useState(0);
  const [totalPillCount, setTotalPillCount] = useState(40);

  const [hasAlert, setHasAlert] = useState(true);
  const WEBCAM_VIDEO_HEIGHT = 568;
  const WEBCAM_VIDEO_WIDTH = 568;
  let inferRunning;
  var model;

  const startPillCountingInference = () => {
    inferRunning = true;
    window.roboflow
      .auth({
        publishable_key: import.meta.env
          .VITE_PUBLISHABLE_ROBOFLOW_API_KEY,
      })
      .load({
        model: import.meta.env.VITE_COUNTING_MODEL_ID,
        version: import.meta.env
          .VITE_COUNTING_MODEL_VERSION,

        onMetadata: function (m) {
          console.log("model loaded");
        },
      })
      .then((model) => {
        setInterval(() => {
          if (inferRunning) detect(model, "#FF0000");
        }, 10);
      });
  };

  const startDamagedPillsInference = () => {
    inferRunning = true;
    window.roboflow
      .auth({
        publishable_key: import.meta.env
          .VITE_PUBLISHABLE_ROBOFLOW_API_KEY,
      })
      .load({
        model: import.meta.env.VITE_DAMAGED_MODEL_ID,
        version: import.meta.env.VITE_DAMAGED_MODEL_VERSION,
        onMetadata: function (m) {
          console.log("model loaded");
        },
      })
      .then((model) => {
        setInterval(() => {
          if (inferRunning) detect(model, "#00FF00");
        }, 10);
      });
  };

  useEffect(() => {
    startPillCountingInference();
    startDamagedPillsInference();
  }, []);

  const detect = async (model, colour) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight =
        webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      console.log(
        "hi" + webcamRef.current.video.videoWidth
      );

      adjustCanvas(videoWidth, videoHeight);

      const detections = await model.detect(
        webcamRef.current.video
      );

      setPillCount(Math.max(detections.length, 0));
      const ctx = canvasRef.current.getContext("2d");
      drawBoxes(detections, ctx, colour);
    }
  };

  const adjustCanvas = (w, h) => {
    canvasRef.current.width = w * window.devicePixelRatio;
    canvasRef.current.height = h * window.devicePixelRatio;

    canvasRef.current.style.width = w + "px";
    canvasRef.current.style.height = h + "px";

    canvasRef.current
      .getContext("2d")
      .scale(
        window.devicePixelRatio,
        window.devicePixelRatio
      );
  };

  const drawBoxes = (detections, ctx, colour) => {
    ctx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    detections.forEach((row) => {
      if (true) {
        //video
        var temp = row.bbox;
        temp.class = row.class;
        temp.color = row.color;
        temp.confidence = row.confidence;
        row = temp;
      }

      if (row.confidence < 0) return;

      //dimensions
      var x = row.x - row.width / 2;
      var y = row.y - row.height / 2;
      var w = row.width;
      var h = row.height;

      //box
      ctx.beginPath();
      ctx.lineWidth = 1;
      // ctx.strokeStyle = row.color;
      ctx.strokeStyle = colour;
      ctx.rect(x, y, w, h);
      ctx.stroke();

      //shade
      ctx.fillStyle = colour;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1.0;

      //label
      var fontColor = "white";
      var fontSize = 12;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      var classTxt = row.class;
      var confTxt =
        (row.confidence * 100).toFixed().toString() + "%";
      var msgTxt = classTxt + " " + confTxt;
      const textHeight = fontSize;
      var textWidth = ctx.measureText(msgTxt).width;

      ctx.strokeStyle = colour;
      ctx.fillStyle = colour;

      if (textHeight <= h && textWidth <= w) {
        ctx.fillRect(
          x - ctx.lineWidth / 2,
          y - textHeight - ctx.lineWidth,
          textWidth + 2,
          textHeight + 1
        );
        ctx.stroke();
        ctx.fillStyle = fontColor;
        ctx.fillText(msgTxt, x + textWidth / 2 + 1, y - 1);
      } else {
        textWidth = ctx.measureText(confTxt).width;
        ctx.fillRect(
          x - ctx.lineWidth / 2,
          y - textHeight - ctx.lineWidth,
          textWidth + 2,
          textHeight + 1
        );
        ctx.stroke();
        ctx.fillStyle = fontColor;
        ctx.fillText(confTxt, x + textWidth / 2 + 1, y - 1);
      }
    });
  };

  // const stopInfer = () => {
  //     inferRunning = false;
  //     if (model) model.teardown();
  // };

  return (
    <div className="p-4 flex h-[600px] gap-4">
      <div
        className={cn(
          "w-[" + WEBCAM_VIDEO_WIDTH + "px]",
          "aspect-square"
        )}
      >
        <div
          className={cn(
            "relative",
            "h-[" + WEBCAM_VIDEO_HEIGHT + "px]",
            "w-[" + WEBCAM_VIDEO_WIDTH + "px]"
          )}
        >
          <Webcam
            ref={webcamRef}
            muted={true}
            videoConstraints={{
              width: WEBCAM_VIDEO_WIDTH,
              height: WEBCAM_VIDEO_HEIGHT,
            }}
            className="absolute left-0 right-0 text-center z-10 rounded-xl"
          />
          <canvas
            ref={canvasRef}
            className="absolute left-0 right-0 text-center z-20"
          />
        </div>
      </div>
      <div className="flex flex-col grow gap-4">
        <PillProgressCard
          pillCount={pillCount}
          totalPillCount={totalPillCount}
        />
        <PillCountChangeKeypad
          totalPillCount={totalPillCount}
          setTotalPillCount={setTotalPillCount}
        />
        <AlertCard
          hasAlert={hasAlert}
          damagedPillCount={damagedPillCount}
        />
      </div>
    </div>
  );
}

export default App;
