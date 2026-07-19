"use client";

import { Button } from "@/components/ui/button";
import { Bell, Bookmark } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SetAlertModal from "./SetAlertModal";

export default function AssetHeader({ symbol }: { symbol: string }) {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const toggleWatchlist = () => {
    const newState = !isWatchlisted;
    setIsWatchlisted(newState);
    console.log("=== Watchlist Updated ===");
    console.log({ symbol, isWatchlisted: newState });
    if (newState) {
      toast.success(`${symbol} added to watchlist!`);
    } else {
      toast.info(`${symbol} removed from watchlist.`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shrink-0">
          <span className="text-black font-bold text-xl sm:text-2xl">
            {symbol[0]}
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-end gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {symbol}
            </h1>
            <span className="text-lg sm:text-xl text-muted-foreground mb-0.5">
              ({symbol === "AAPL" ? "Apple Inc." : "Company"})
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              NASDAQ
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-sm text-success font-medium">
              Open Market
            </span>
          </div>
        </div>
      </div>

      {/* Actions and Price */}
      <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto">
        <div className="grid grid-cols-2 md:flex items-center gap-3 w-full md:w-auto">
          <Button
            onClick={toggleWatchlist}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium cursor-pointer transform-gpu overflow-hidden ${
              isWatchlisted
                ? "bg-gradient-to-r from-[#ffd451] via-[#fff7a4] to-[#ffd73c] text-black border-none hover:opacity-90"
                : "border border-border bg-card hover:bg-muted/20 text-foreground"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 shrink-0 ${isWatchlisted ? "fill-black" : ""}`}
            />
            <span className="truncate">
              {isWatchlisted ? "Watchlisted" : "Add to Watchlist"}
            </span>
          </Button>
          <Button
            onClick={() => setIsAlertModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted/20 transition-all text-sm font-medium text-foreground cursor-pointer transform-gpu"
          >
            <Bell className="w-4 h-4 shrink-0" />
            Set Alert
          </Button>
        </div>
        <div className="flex flex-col items-start md:items-end mt-2 md:mt-0">
          <span className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            $241.50
          </span>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-success font-medium text-sm flex items-center gap-1">
              <span className="text-xs">↗</span> +$3.24 (+1.36%)
            </span>
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              3.24 M
            </span>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      {isAlertModalOpen && (
        <SetAlertModal onClose={() => setIsAlertModalOpen(false)} />
      )}
    </div>
  );
}
