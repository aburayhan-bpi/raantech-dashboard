"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AiConfidenceMeterProps {
  value: number; // 0 to 100
  className?: string;
}

export default function AiConfidenceMeter({
  value,
  className,
}: AiConfidenceMeterProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Determine color based on value
  let colorClass = "bg-success";
  let textColorClass = "text-success";

  if (clampedValue < 50) {
    colorClass = "bg-error";
    textColorClass = "text-error";
  } else if (clampedValue < 60) {
    colorClass = "golden-gradient-card";
    textColorClass = "golden-gradient-text";
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-2 flex-1 max-w-30 bg-foreground/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClass)}
        />
      </div>
      <span className={cn("text-sm font-normal min-w-[3ch]", textColorClass)}>
        {clampedValue}%
      </span>
    </div>
  );
}
