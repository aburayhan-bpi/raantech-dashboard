"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";

const HighConfidenceSetup = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-2xl p-5 sm:p-6 border-l border-brand-20 w-full flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-5 h-5 text-brand golden-gradient-icon" />
        <h2 className="text-foreground text-lg font-semibold">
          High Confidence Setup
        </h2>
      </div>

      <div className="flex flex-col flex-1 gap-6">
        {/* Top: Asset & Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
              <span className="text-black font-bold text-sm">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-semibold text-sm">
                AAPL
              </span>
              <span className="text-muted-foreground text-xs">
                (Apple Inc.)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-success text-xs font-semibold">
              Strong Buy
            </span>
          </div>
        </div>

        {/* Middle: Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              Confidence Score
            </span>
            <span className="text-foreground font-bold text-sm">90%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "90%" }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="h-full bg-success rounded-full"
            />
          </div>
        </div>

        {/* Bottom: Reason */}
        <div className="flex flex-col gap-1 mt-auto">
          <span className="text-muted-foreground text-xs font-medium">
            Reason:
          </span>
          <p className="text-foreground text-sm">
            Breakout confirmed with strong volume.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default HighConfidenceSetup;
