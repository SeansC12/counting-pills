import * as React from "react";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function PillProgressCard({
  pillCount,
  totalPills,
}) {
  const isExceeded = pillCount > totalPills;
  const progressValue = isExceeded
    ? 100
    : (pillCount / totalPills) * 100;

  return (
    <Card className="flex items-center">
      <CardContent className="p-3 grow">
        <div className="flex items-center justify-center mb-2">
          {/* <span className="text-lg font-medium">
            Pill Count
          </span> */}
          <span
            className={cn(
              "text-4xl font-bold",
              isExceeded && "text-red-500"
            )}
          >
            {Math.max(pillCount, 0)}/{totalPills}
          </span>
        </div>
        <Progress
          value={progressValue}
          className={cn(
            "grow",
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
