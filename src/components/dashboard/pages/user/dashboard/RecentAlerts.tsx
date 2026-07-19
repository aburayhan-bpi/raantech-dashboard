"use client";

import { motion } from "framer-motion";
import { AlarmClock } from "lucide-react";

const data = [
  {
    id: 1,
    time: "3 Minute Ago",
    symbol: "AAPL",
    name: "Apple Inc.",
    type: "Breakout Alert",
    desc: "Reached resistance zone at $895.00",
  },
  {
    id: 2,
    time: "3 Minute Ago",
    symbol: "TSLA",
    name: "Tesla, Inc.",
    type: "Breakout Alert",
    desc: "Reached resistance zone at $895.00",
  },
  {
    id: 3,
    time: "3 Minute Ago",
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    type: "Breakout Alert",
    desc: "Reached resistance zone at $895.00",
  },
  {
    id: 4,
    time: "3 Minute Ago",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    type: "Breakout Alert",
    desc: "Reached resistance zone at $895.00",
  },
  {
    id: 5,
    time: "3 Minute Ago",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    type: "Breakout Alert",
    desc: "Reached resistance zone at $895.00",
  },
];

const RecentAlerts = () => {
  return (
    <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border w-full flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <AlarmClock className="w-5 h-5 text-brand golden-gradient-icon" />
        <h2 className="text-foreground text-lg font-semibold">Recent Alerts</h2>
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
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
              <span className="text-muted-foreground text-xs font-medium truncate">
                {item.time}
              </span>
            </div>

            {/* Middle Section */}
            <div className="flex items-center gap-2 sm:gap-3 flex-2 min-w-0 px-1 sm:px-2">
              <motion.div
                // whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shrink-0"
              >
                <span className="text-black font-bold text-xs sm:text-sm">
                  {item.symbol[0]}
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

            {/* Right Section */}
            <div className="flex flex-col items-end flex-[1.5] min-w-0 pl-1 sm:pl-2">
              <span className="golden-gradient-text text-xs sm:text-sm font-semibold mb-1 truncate max-w-full">
                {item.type}
              </span>
              <span className="text-muted-foreground text-[10px] sm:text-xs text-right truncate max-w-full">
                {item.desc}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlerts;
