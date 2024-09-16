import { useRef, useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import PillProgressCard from "./components/PillProgressCard";
import AlertCard from "./components/AlertCard";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [pillCount, setPillCount] = useState(5);
  const [totalPills, setTotalPills] = useState(40);
  const [hasAlert, setHasAlert] = useState(true);
  let inferRunning;
  var model;

  const startPillCountingInference = () => {
    inferRunning = false;
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
    inferRunning = false;
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

  // const stopInfer = () => {
  //     inferRunning = false;
  //     if (model) model.teardown();
  // };

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

      console.log(colour);

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

  return (
    <div className="p-2 flex h-[600px]">
      <div className="flex flex-col h-full gap-2">
        <div className="h-[480px] aspect-[4/3] relative">
          {/* <div className="relative z-10"> */}
          <Webcam
            ref={webcamRef}
            muted={true}
            className="absolute left-0 right-0 text-center z-10"
          />
          <canvas
            ref={canvasRef}
            className="absolute left-0 right-0 text-center z-20"
          />
        </div>
        {/* </div> */}
        <div className="grow">
          <PillProgressCard
            pillCount={pillCount}
            totalPills={totalPills}
          />
        </div>
        {/* <button
          onClick={() =>
            setPillCount((curr) => Math.max((curr += 1), 1))
          }
        >
          +
        </button>
        <button
          onClick={() =>
            setPillCount((curr) => Math.max((curr -= 1), 0))
          }
        >
          -
        </button> */}
      </div>
      <div className="flex flex-col">
        <AlertCard hasAlert={hasAlert} />
      </div>
    </div>
  );
}

export default App;
