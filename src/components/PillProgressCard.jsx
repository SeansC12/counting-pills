import * as React from "react";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function PillProgressCard({
  pillCount,
  totalPillCount,
}) {
  console.log(pillCount);
  const isExceeded = pillCount > totalPillCount;
  const isCorrectValue =
    pillCount.toString() === totalPillCount;
  const progressValue = isExceeded
    ? 100
    : (pillCount / totalPillCount) * 100;

  return (
    <Card className="flex items-center grow">
      <CardContent className="p-3 grow">
        <div className="flex items-center justify-center mb-5">
          {/* <span className="text-lg font-medium">
            Pill Count
          </span> */}
          <span
            className={cn(
              "text-4xl font-bold",
              isCorrectValue && "text-green-500",
              isExceeded && "text-red-500"
            )}
          >
            {Math.max(pillCount, 0)}/{totalPillCount || "0"}
          </span>
        </div>
        <Progress
          value={progressValue}
          className={cn(
            "grow",
            isCorrectValue && "[&>div]:bg-green-500",
            isExceeded && "[&>div]:bg-red-500"
          )}
          // className={cn(
          //   "h-1.5",
          //   isExceeded ? "bg-red-200" : "bg-secondary",
          //   "[&>div]:bg-primary [&>div]:transition-all",
          //   isExceeded && "[&>div]:bg-red-500"
          // )}
        />
      </CardContent>
    </Card>
  );
}
