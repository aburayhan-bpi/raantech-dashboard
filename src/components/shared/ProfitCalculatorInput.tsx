"use client";
import { useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfitCalculatorInputProps {
  buyingPrice: number;
  sellingPrice: number;
  onBuyingPriceChange: (value: number) => void;
  onSellingPriceChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export default function ProfitCalculatorInput({
  buyingPrice,
  sellingPrice,
  onBuyingPriceChange,
  onSellingPriceChange,
  className,
  disabled = false,
}: ProfitCalculatorInputProps) {
  const { margin, profit, isLoss } = useMemo(() => {
    if (!buyingPrice || !sellingPrice || buyingPrice === 0) {
      return { margin: 0, profit: 0, isLoss: false };
    }
    
    const profitVal = sellingPrice - buyingPrice;
    const marginVal = (profitVal / sellingPrice) * 100;
    
    return {
      margin: parseFloat(marginVal.toFixed(2)),
      profit: parseFloat(profitVal.toFixed(2)),
      isLoss: profitVal < 0,
    };
  }, [buyingPrice, sellingPrice]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buying Price */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Buying Price (Unit Cost)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={buyingPrice || ""}
              onChange={(e) => onBuyingPriceChange(parseFloat(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0.00"
              className={cn(
                "w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all",
                disabled && "opacity-50 cursor-not-allowed bg-slate-50"
              )}
            />
          </div>
        </div>

        {/* Selling Price */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Selling Price (Retail)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice || ""}
              onChange={(e) => onSellingPriceChange(parseFloat(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0.00"
              className={cn(
                "w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all",
                disabled && "opacity-50 cursor-not-allowed bg-slate-50"
              )}
            />
          </div>
        </div>
      </div>

      {/* Profit Analysis Badge */}
      {(buyingPrice > 0 || sellingPrice > 0) && (
        <div 
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            isLoss 
              ? "bg-error/10 border-error/20 text-error"
              : "bg-success/10 border-success/20 text-success"
          )}
        >
          <div className="flex items-center space-x-2">
            {isLoss ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            <span className="font-medium text-sm">
              {isLoss ? "Loss Analysis" : "Profit Margin"}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm font-semibold">
            <span>Profit: ৳{profit}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/50 border border-success/20">
              {margin}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
