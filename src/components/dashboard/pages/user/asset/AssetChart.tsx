/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const mockData: Record<string, any[]> = {
  "1D": [
    { date: "9:30 AM", price: 238.5 },
    { date: "10:00 AM", price: 239.2 },
    { date: "10:30 AM", price: 238.8 },
    { date: "11:00 AM", price: 240.1 },
    { date: "11:30 AM", price: 242.5 },
    { date: "12:00 PM", price: 240.5 },
    { date: "12:30 PM", price: 239.8 },
    { date: "1:00 PM", price: 241.0 },
    { date: "1:30 PM", price: 241.8 },
    { date: "2:00 PM", price: 243.2 },
    { date: "2:30 PM", price: 242.0 },
    { date: "3:00 PM", price: 244.5 },
    { date: "3:30 PM", price: 245.0 },
    { date: "4:00 PM", price: 241.5 },
  ],
  "1W": [
    { date: "Mon", price: 235.0 },
    { date: "Tue", price: 238.5 },
    { date: "Wed", price: 232.0 },
    { date: "Thu", price: 239.5 },
    { date: "Fri", price: 241.5 },
  ],
  "1M": [
    { date: "May 1", price: 230.5 },
    { date: "May 2", price: 232.0 },
    { date: "May 3", price: 234.1 },
    { date: "May 4", price: 235.5 },
    { date: "May 5", price: 233.8 },
    { date: "May 6", price: 236.2 },
    { date: "May 7", price: 238.0 },
    { date: "May 8", price: 239.5 },
    { date: "May 9", price: 240.2 },
    { date: "May 10", price: 242.0 },
    { date: "May 11", price: 243.5 },
    { date: "May 12", price: 245.0 },
    { date: "May 13", price: 244.2 },
    { date: "May 14", price: 238.5 },
    { date: "May 15", price: 233.5 },
    { date: "May 16", price: 230.0 },
    { date: "May 17", price: 231.0 },
    { date: "May 18", price: 231.5 },
    { date: "May 19", price: 233.2 },
    { date: "May 20", price: 235.0 },
    { date: "May 21", price: 237.0 },
    { date: "May 22", price: 236.5 },
    { date: "May 23", price: 234.0 },
    { date: "May 24", price: 231.5 },
    { date: "May 25", price: 229.0 },
    { date: "May 26", price: 228.0 },
    { date: "May 27", price: 228.5 },
    { date: "May 28", price: 232.0 },
    { date: "May 29", price: 236.5 },
    { date: "May 30", price: 239.0 },
    { date: "May 31", price: 241.5 },
  ],
  "1Y": [
    { date: "Jan", price: 180 },
    { date: "Feb", price: 190 },
    { date: "Mar", price: 185 },
    { date: "Apr", price: 210 },
    { date: "May", price: 230 },
    { date: "Jun", price: 245 },
    { date: "Jul", price: 260 },
    { date: "Aug", price: 255 },
    { date: "Sep", price: 250 },
    { date: "Oct", price: 265 },
    { date: "Nov", price: 275 },
    { date: "Dec", price: 280 },
  ],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // A simple hack to append 2025 to months to match the screenshot,
    // but keep times/days as they are for 1D and 1W.
    const displayLabel =
      label?.includes("May") ||
      label?.includes("Jan") ||
      label?.includes("Dec") ||
      label?.includes("Feb") ||
      label?.includes("Mar") ||
      label?.includes("Apr") ||
      label?.includes("Jun") ||
      label?.includes("Jul") ||
      label?.includes("Aug") ||
      label?.includes("Sep") ||
      label?.includes("Oct") ||
      label?.includes("Nov")
        ? `${label} 2025`
        : label;

    return (
      <div className="bg-chart-tooltip-bg backdrop-blur-sm border-[1.9px] border-brand rounded-2xl px-4 py-3 shadow-2xl">
        <p className="golden-gradient-text font-bold text-md leading-none tracking-tight">
          ${payload[0].value.toFixed(2)}
        </p>
        <p className="text-chart-tooltip-text text-xs font-medium mt-2.5">
          {displayLabel}
        </p>
      </div>
    );
  }
  return null;
};

export default function AssetChart() {
  const [activeTab, setActiveTab] = useState("1M");
  const currentData = mockData[activeTab];

  // Dynamically adjust YAxis domain based on data
  const prices = currentData.map((d) => d.price);
  const minPrice = Math.min(...prices) * 0.95; // 5% padding below
  const maxPrice = Math.max(...prices) * 1.05; // 5% padding above

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-20 border border-border flex flex-col relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-br from-brand/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 pb-2 relative z-10 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-foreground font-semibold">
            AAPL - Stock Chart
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-success text-xs font-semibold">
              +1.36% today
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-background/50 p-1 rounded-xl border border-border">
          {["1D", "1W", "1M", "1Y"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab
                  ? "golden-gradient-card text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-100 w-full mt-4 pr-6 pb-6 relative z-10 **:outline-none">
        <ResponsiveContainer
          width="100%"
          height="100%"
          className="outline-none!"
        >
          <AreaChart
            data={currentData}
            margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            style={{ outline: "none" }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-brand)"
                  stopOpacity={0.7}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-brand)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={true}
              horizontal={true}
              stroke="rgba(234, 179, 8, 0.15)"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={
                activeTab === "1M"
                  ? { fill: "var(--color-muted-foreground)", fontSize: 10, angle: -45, textAnchor: "end" }
                  : { fill: "var(--color-muted-foreground)", fontSize: 10 }
              }
              dy={10}
              minTickGap={0}
              interval={0}
              height={activeTab === "1M" ? 40 : 30}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              dx={-10}
              tickCount={8}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "var(--color-brand)", strokeWidth: 1 }}
            />
            <Area
              type="linear"
              dataKey="price"
              stroke="var(--color-brand)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              activeDot={{
                r: 6,
                fill: "var(--color-brand)",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
