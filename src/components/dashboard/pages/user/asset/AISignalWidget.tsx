"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function AISignalWidget({ className }: { className?: string }) {
  const percentage = 89;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-20 p-6 border border-border flex flex-col relative overflow-hidden h-full w-full ${className || ""}`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-brand/5 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 golden-gradient-icon" />
          <span className="text-foreground font-semibold">AI Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-success text-xs font-semibold">Bullish</span>
          </div>
          <span className="text-muted-foreground text-xs">(Strong)</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 relative z-10">
        <span className="text-muted-foreground text-xs mb-4">
          Confidence Score & Reason
        </span>

        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-muted/30"
              strokeWidth="10"
              fill="none"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              cx="50"
              cy="50"
              r={radius}
              className="stroke-success"
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex items-center justify-center">
            <span className="text-success text-3xl font-bold">
              {percentage}%
            </span>
          </div>
        </div>

        <p className="text-sm text-foreground/80 text-center mt-6 leading-relaxed">
          Price broke above key resistance level with strong volume
          confirmation.
        </p>
      </div>
    </motion.div>
  );
}
