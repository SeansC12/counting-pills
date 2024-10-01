import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function calculateMedian(values) {
  // Sorting values, preventing original array
  // from being mutated.
  values = [...values].sort((a, b) => a - b);

  const half = Math.floor(values.length / 2);

  return values.length % 2
    ? values[half]
    : (values[half - 1] + values[half]) / 2;
}

export const adjustCanvas = (webcamRef, canvasRef) => {
  const videoWidth = webcamRef.current.video.videoWidth;
  const videoHeight = webcamRef.current.video.videoHeight;

  webcamRef.current.video.width = videoWidth;
  webcamRef.current.video.height = videoHeight;

  canvasRef.current.width =
    videoWidth * window.devicePixelRatio;
  canvasRef.current.height =
    videoHeight * window.devicePixelRatio;

  canvasRef.current.style.width = videoWidth + "px";
  canvasRef.current.style.height = videoHeight + "px";

  canvasRef.current
    .getContext("2d")
    .scale(
      window.devicePixelRatio,
      window.devicePixelRatio
    );
};

export const drawBoxes = (
  canvasRef,
  detections,
  normalColour,
  brokenColour
) => {
  const ctx = canvasRef.current.getContext("2d");

  ctx.clearRect(
    0,
    0,
    canvasRef.current.width,
    canvasRef.current.height
  );
  detections.forEach((row, index) => {
    if (row.confidence < 0) return;
    let colourToUse;
    if (row.is_damaged) {
      colourToUse = brokenColour;
    } else {
      colourToUse = normalColour;
    }

    // circle
    ctx.beginPath();
    ctx.strokeStyle = colourToUse;
    ctx.arc(row.x, row.y, 6.0, 0, 2 * Math.PI);
    ctx.fillStyle = colourToUse;
    ctx.fill();
  });
};
