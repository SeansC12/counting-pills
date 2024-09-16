import React, { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Alert = ({ message }) => (
  <div className="flex items-center space-x-2 bg-destructive/15 text-destructive rounded-md p-3">
    <AlertCircle className="h-4 w-4" />
    <span className="text-sm font-medium">{message}</span>
  </div>
);

export default function AlertCard({ hasAlert }) {
  return (
    <Card
      className={cn(
        "transition-colors duration-300 w-full",
        hasAlert ? "border-destructive" : "border-green-500"
      )}
    >
      <CardContent className="pt-6">
        {hasAlert ? (
          <Alert message="xxxx Damaged pills detected" />
        ) : (
          <div className="flex items-center space-x-2 bg-green-100 text-green-700 rounded-md p-3">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">
              All systems normal
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
