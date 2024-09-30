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

export const getDamagedPills = (detections, error) => {
  if (detections.length < 1) return [];
  let totalArea = 0;
  let areasOfPills = [];
  let damagedIndexes = [];

  detections.forEach((row) => {
    const area = row.width * row.height;
    totalArea += area;
    areasOfPills.push(area);
  });

  const median = calculateMedian(areasOfPills);
  const mean =
    areasOfPills.reduce((acc, c) => acc + c, 0) /
    areasOfPills.length;

  detections.forEach((row, index) => {
    const area = row.width * row.height;
    if (area < median * (1 - error)) {
      damagedIndexes.push(index);
    }
  });

  return damagedIndexes;
};

export const adjustCanvas = (canvasRef, w, h) => {
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

export const drawBoxes = (
  canvasRef,
  detections,
  ctx,
  normalColour,
  brokenColour,
  brokenPillIndexes
) => {
  ctx.clearRect(
    0,
    0,
    canvasRef.current.width,
    canvasRef.current.height
  );
  detections.forEach((row, index) => {
    if (row.confidence < 0) return;
    let colourToUse;
    if (brokenPillIndexes.includes(index)) {
      colourToUse = brokenColour;
    } else {
      colourToUse = normalColour;
    }

    // dimensions
    const radius = row.width * 0.2;

    // circle
    ctx.beginPath();
    ctx.strokeStyle = colourToUse;
    ctx.arc(row.x, row.y, 6.0, 0, 2 * Math.PI);
    ctx.fillStyle = colourToUse;
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

    // ctx.strokeStyle = normalColour;
    // ctx.fillStyle = normalColour;

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
