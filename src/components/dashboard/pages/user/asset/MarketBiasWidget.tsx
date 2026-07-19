"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function MarketBiasWidget({
  className,
}: {
  className?: string;
}) {
  const biases = [
    {
      ticker: "SPY",
      name: "S&P 500",
      bias: "Bearish",
      percent: "78%",
      bg: "bg-[#0f291e]",
      text: "text-success",
      border: "border-success/20",
    },
    {
      ticker: "QQQ",
      name: "NASDAQ 100",
      bias: "Bearish",
      percent: "52%",
      bg: "bg-[#29220f]",
      text: "text-brand",
      border: "border-brand/20",
    },
    {
      ticker: "IWM",
      name: "Russell 2000",
      bias: "Bearish",
      percent: "67%",
      bg: "bg-[#290f14]",
      text: "text-error",
      border: "border-error/20",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`bg-card rounded-20 p-6 border border-border flex flex-col relative overflow-hidden h-full w-full ${className || ""}`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-brand/5 to-transparent pointer-events-none" />

      <div className="flex items-center gap-2 mb-6 relative z-10">
        <TrendingUp className="w-5 h-5 golden-gradient-icon" />
        <span className="text-foreground font-semibold">Market Bias</span>
      </div>

      <div className="flex flex-col gap-4 relative z-10 flex-1 justify-center">
        {biases.map((b, i) => (
          <div
            key={i}
            className={`rounded-16 p-4 flex items-center justify-between ${b.bg} border ${b.border}`}
          >
            <div className="flex flex-col">
              <span className="text-foreground font-bold text-lg leading-tight">
                {b.ticker}
              </span>
              <span className="text-muted-foreground text-xs mt-0.5">
                {b.name}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`font-bold text-lg leading-tight ${b.text}`}>
                {b.bias}
              </span>
              <span className={`${b.text} text-xs opacity-70 mt-0.5`}>
                {b.percent}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
