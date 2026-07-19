"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface AssetCardProps {
  symbol: string;
  name: string;
  price: number;
  change: string; // Accepts: "+$3.24", "+3.24", "-2.15" etc.
  logo?: string;
  className?: string;
}

const AssetCard: React.FC<AssetCardProps> = ({
  symbol,
  name,
  price,
  change,
  logo,
  className,
}) => {
  // Determine if positive or negative
  const isPositive = change.trim().startsWith("+");
  const displayChange = change.trim();

  return (
    <Link href={`/dashboard/user/asset/${symbol}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        // whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "bg-card hover:bg-muted/20 border-l border-b border-foreground-20 rounded-2xl p-4 md:p-5 flex flex-col justify-between cursor-pointer h-full",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <motion.div
            // whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-foreground flex items-center justify-center shrink-0 overflow-hidden"
          >
            {logo ? (
              <Image
                src={logo}
                alt={`${symbol} logo`}
                width={48}
                height={48}
                className="object-contain w-full h-full p-1"
              />
            ) : (
              <span className="text-black font-bold text-sm sm:text-base">
                {symbol.slice(0, 1)}
              </span>
            )}
          </motion.div>

          {/* Symbol & Name */}
          <div className="flex flex-col min-w-0">
            <span className="text-foreground font-bold text-sm sm:text-base truncate">
              {symbol}
            </span>
            <span className="text-muted-foreground text-xs sm:text-sm truncate">
              {name}
            </span>
          </div>
        </div>

        {/* Price & Change */}
        <div className="flex flex-col mt-6 sm:mt-8">
          <span className="text-foreground font-bold text-lg sm:text-xl">
            $
            {price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span
            className={cn(
              "text-xs sm:text-sm font-medium mt-0.5",
              isPositive ? "text-success" : "text-error",
            )}
          >
            {displayChange}
          </span>
        </div>
      </motion.div>
    </Link>
  );
};

export default AssetCard;
