import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import useInference from "./hooks/useInference";
import { cn } from "./lib/utils";

import PillProgressCard from "./components/PillProgressCard";
import AlertCard from "./components/AlertCard";
import PillCountChangeKeypad from "./components/Keypad";
// import PulsingBorder from "./components/PulsingBorder";

const WEBCAM_VIDEO_HEIGHT = 568;
const WEBCAM_VIDEO_WIDTH = 568;

function App() {
  const webcamRef = useRef();
  const canvasRef = useRef();

  const [pillCount, setPillCount] = useState(0);
  const [damagedPillCount, setDamagedPillCount] =
    useState(0);
  const [totalPillCount, setTotalPillCount] = useState(40);

  const [hasAlert, setHasAlert] = useState(true);

  useEffect(() => {
    const fetchInterval = setInterval(async () => {
      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        const imageToSend =
          webcamRef.current.getScreenshot();

        const res = await fetch("http://127.0.0.1:5001", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: imageToSend,
          }),
        });

        const data = await res.json();

        console.log(data.predictions);
        setPillCount(data ? data.predictions.length : 0);

        const detections = data.predictions;
        const colour = "#FF0000";

        const videoWidth =
          webcamRef.current.video.videoWidth;
        const videoHeight =
          webcamRef.current.video.videoHeight;

        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        adjustCanvas(videoWidth, videoHeight);

        const ctx = canvasRef.current.getContext("2d");
        if (detections) drawBoxes(detections, ctx, colour);
      }
    }, 500);
    return () => {
      clearInterval(fetchInterval);
    };
  }, []);

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
      if (row.confidence < 0) return;

      // dimensions
      const radius = row.width * 0.2;

      // circle
      ctx.beginPath();
      ctx.strokeStyle = colour;
      ctx.arc(row.x, row.y, 6.0, 0, 2 * Math.PI);
      ctx.fillStyle = colour;
      ctx.fill();

      // label
      // var fontColor = "white";
      // var fontSize = 12;
      // ctx.font = `${fontSize}px monospace`;
      // ctx.textAlign = "center";
      // var classTxt = row.class;
      // var confTxt =
      //   (row.confidence * 100).toFixed().toString() + "%";
      // var msgTxt = classTxt + " " + confTxt;
      // const textHeight = fontSize;
      // var textWidth = ctx.measureText(msgTxt).width;

      // ctx.strokeStyle = colour;
      // ctx.fillStyle = colour;

      // if (textHeight <= h && textWidth <= w) {
      //   ctx.fillRect(
      //     x - ctx.lineWidth / 2,
      //     y - textHeight - ctx.lineWidth,
      //     textWidth + 2,
      //     textHeight + 1
      //   );
      //   ctx.stroke();
      //   ctx.fillStyle = fontColor;
      //   ctx.fillText(msgTxt, x + textWidth / 2 + 1, y - 1);
      // } else {
      //   textWidth = ctx.measureText(confTxt).width;
      //   ctx.fillRect(
      //     x - ctx.lineWidth / 2,
      //     y - textHeight - ctx.lineWidth,
      //     textWidth + 2,
      //     textHeight + 1
      //   );
      //   ctx.stroke();
      //   ctx.fillStyle = fontColor;
      //   ctx.fillText(confTxt, x + textWidth / 2 + 1, y - 1);
      // }
    });
  };

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
            screenshotFormat="image/jpeg"
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
