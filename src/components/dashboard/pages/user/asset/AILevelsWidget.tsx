"use client";

import { motion } from "framer-motion";
import { Circle, Diamond, Star, Target, Triangle } from "lucide-react";

export default function AILevelsWidget({ className }: { className?: string }) {
  const levels = [
    {
      icon: <Triangle className="w-3.5 h-3.5 fill-success text-success" />,
      label: "Support",
      value: "$232.80",
      valueClass: "text-success",
    },
    {
      icon: (
        <Triangle className="w-3.5 h-3.5 fill-error text-error transform rotate-180" />
      ),
      label: "Resistance",
      value: "$248.20",
      valueClass: "text-error",
    },
    {
      icon: <Diamond className="w-3.5 h-3.5 fill-[#3b82f6] text-[#3b82f6]" />,
      label: "Breakout",
      value: "$250.00",
      valueClass: "text-[#3b82f6]",
    },
    {
      icon: <Star className="w-3.5 h-3.5 fill-brand text-brand" />,
      label: "AI Target (30d)",
      value: "$241.50",
      valueClass: "text-brand",
    },
    {
      icon: <Circle className="w-3.5 h-3.5 fill-success text-success" />,
      label: "Confidence",
      value: "89%",
      valueClass: "text-success",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`bg-card rounded-20 p-6 border border-border flex flex-col relative overflow-hidden h-full w-full ${className || ""}`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-brand/5 to-transparent pointer-events-none" />

      <div className="flex items-center gap-2 mb-8 relative z-10">
        <Target className="w-5 h-5 golden-gradient-icon" />
        <span className="text-foreground font-semibold">AI Levels</span>
      </div>

      <div className="flex flex-col gap-6 flex-1 justify-center relative z-10">
        {levels.map((level, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-background/50 group-hover:bg-background transition-colors">
                {level.icon}
              </div>
              <span className="text-muted-foreground text-sm font-medium">
                {level.label}
              </span>
            </div>
            <span className={`font-bold text-lg ${level.valueClass}`}>
              {level.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
