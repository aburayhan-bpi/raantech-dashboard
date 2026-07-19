"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="stroke-success/20"
          strokeWidth="8"
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
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-muted-foreground text-xs font-medium">
          Bias Score
        </span>
        <span className="text-success text-3xl font-bold">{percentage}%</span>
      </div>
    </div>
  );
};

const DailyAIOutlook = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-2xl p-5 sm:p-6 border-l border-brand-20 w-full flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 golden-gradient-icon" />
          <h2 className="text-foreground text-lg font-semibold">
            Daily AI Outlook
          </h2>
        </div>
        <span className="text-muted-foreground text-xs sm:text-sm">
          Jun 13, 2026
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 sm:gap-8 flex-1">
        {/* Left: Gauge and Status */}
        <div className="flex flex-col items-center justify-center gap-4">
          <CircularProgress percentage={89} />
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-success/10 border border-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-success text-sm font-semibold">Bullish</span>
          </div>
        </div>

        {/* Right: Content Cards */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Summary Card */}
          <div className="bg-background/50 rounded-xl p-4 border border-border/50">
            <span className="text-muted-foreground text-xs font-medium block mb-2">
              Today Market Bias AI Summary
            </span>
            <p className="text-foreground text-sm leading-relaxed">
              Large-cap tech continues leading with NVDA and META showing
              institutional accumulation. SPY holding above key 20-day MA.
              Sector rotation into AI/semis. Watch IWM for broader market
              confirmation.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-background/50 rounded-xl p-3 sm:p-4 border border-border/50 flex flex-col justify-between">
              <span className="text-muted-foreground text-[10px] sm:text-xs font-medium mb-1">
                Bullish setups
              </span>
              <span className="text-success font-bold text-lg sm:text-xl">
                68
              </span>
            </div>
            <div className="bg-background/50 rounded-xl p-3 sm:p-4 border border-border/50 flex flex-col justify-between">
              <span className="text-muted-foreground text-[10px] sm:text-xs font-medium mb-1">
                Neutral
              </span>
              <span className="golden-gradient-text font-bold text-lg sm:text-xl">
                24
              </span>
            </div>
            <div className="bg-background/50 rounded-xl p-3 sm:p-4 border border-border/50 flex flex-col justify-between">
              <span className="text-muted-foreground text-[10px] sm:text-xs font-medium mb-1">
                Bearish
              </span>
              <span className="text-error font-bold text-lg sm:text-xl">
                18
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyAIOutlook;
