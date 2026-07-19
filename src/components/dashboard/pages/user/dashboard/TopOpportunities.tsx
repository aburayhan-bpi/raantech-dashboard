"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

const data = [
  {
    id: 1,
    rank: "#1",
    symbol: "AAPL",
    name: "Apple Inc.",
    sentiment: "Bullish",
    score: "91%",
    target: "$960",
  },
  {
    id: 2,
    rank: "#1",
    symbol: "AAPL",
    name: "Apple Inc.",
    sentiment: "Bullish",
    score: "91%",
    target: "$960",
  },
  {
    id: 3,
    rank: "#1",
    symbol: "AAPL",
    name: "Apple Inc.",
    sentiment: "Bullish",
    score: "91%",
    target: "$960",
  },
  {
    id: 4,
    rank: "#1",
    symbol: "AAPL",
    name: "Apple Inc.",
    sentiment: "Bullish",
    score: "91%",
    target: "$960",
  },
  {
    id: 5,
    rank: "#1",
    symbol: "AAPL",
    name: "Apple Inc.",
    sentiment: "Bullish",
    score: "91%",
    target: "$960",
  },
];

const TopOpportunities = () => {
  return (
    <div className="bg-card rounded-2xl p-5 sm:p-6 border-l border-brand-20 w-full flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Flame className="w-5 h-5 golden-gradient-icon" />
        <h2 className="text-foreground text-lg font-semibold">
          Top Opportunities
        </h2>
      </div>

      <div className="flex flex-col flex-1">
        {data.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className={`group flex items-center justify-between py-3 sm:py-4 px-2 sm:px-3 rounded-xl hover:bg-muted/20 ${
              index !== data.length - 1 ? "border-b border-border/60" : ""
            }`}
          >
            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-4 flex-2 min-w-0 pr-2">
              <span className="text-muted-foreground text-xs sm:text-sm font-medium w-4 shrink-0">
                {item.rank}
              </span>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <motion.div
                  //   whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shrink-0"
                >
                  <span className="text-black font-bold text-xs sm:text-sm">
                    A
                  </span>
                </motion.div>
                <div className="flex flex-col min-w-0">
                  <span className="text-foreground font-semibold text-xs sm:text-sm truncate">
                    {item.symbol}
                  </span>
                  <span className="text-muted-foreground text-xs truncate">
                    ({item.name})
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section */}
            <div className="flex flex-col items-center flex-1 shrink-0 px-1">
              <span className="text-success text-[10px] sm:text-xs font-medium mb-1 truncate">
                {item.sentiment}
              </span>
              <span className="text-success font-bold text-xs sm:text-sm">
                {item.score}
              </span>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-end flex-1 shrink-0 pl-2">
              <span className="golden-gradient-text text-[10px] sm:text-xs font-medium mb-1 truncate">
                AI Target
              </span>
              <span className="golden-gradient-text font-bold text-xs sm:text-sm">
                {item.target}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopOpportunities;
