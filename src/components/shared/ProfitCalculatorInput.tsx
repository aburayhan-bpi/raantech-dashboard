"use client";
import { cn } from "@/lib/utils";
import { DollarSign, Info, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsTooltipOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { margin, markup, profit, isLoss } = useMemo(() => {
    if (!buyingPrice || !sellingPrice || buyingPrice === 0) {
      return { margin: 0, markup: 0, profit: 0, isLoss: false };
    }

    const profitVal = sellingPrice - buyingPrice;
    const marginVal = (profitVal / sellingPrice) * 100;
    const markupVal = (profitVal / buyingPrice) * 100;

    return {
      margin: parseFloat(marginVal.toFixed(2)),
      markup: parseFloat(markupVal.toFixed(2)),
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
              onChange={(e) =>
                onBuyingPriceChange(parseFloat(e.target.value) || 0)
              }
              disabled={disabled}
              placeholder="0.00"
              className={cn(
                "w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all",
                disabled && "opacity-50 cursor-not-allowed bg-slate-50",
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
              onChange={(e) =>
                onSellingPriceChange(parseFloat(e.target.value) || 0)
              }
              disabled={disabled}
              placeholder="0.00"
              className={cn(
                "w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all",
                disabled && "opacity-50 cursor-not-allowed bg-slate-50",
              )}
            />
          </div>
        </div>
      </div>

      {/* Profit Analysis Badge */}
      {(buyingPrice > 0 || sellingPrice > 0) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border bg-transparent mt-2 gap-4">
          <div className="flex items-center justify-between md:justify-start space-x-2">
            {isLoss ? (
              <TrendingDown className="w-5 h-5 text-error" />
            ) : (
              <TrendingUp className="w-5 h-5 text-success" />
            )}
            <div
              className="flex items-center space-x-1.5 relative"
              ref={tooltipRef}
            >
              <span className="font-medium text-sm text-slate-700">
                {isLoss ? "Loss Analysis" : "Profit Analysis"}
              </span>
              <button
                type="button"
                className="focus:outline-none rounded-full p-1 -m-1 hover:bg-slate-100 transition-colors"
                onClick={() => setIsTooltipOpen(!isTooltipOpen)}
              >
                <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
              </button>

              {isTooltipOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-slate-900/20 z-[99] backdrop-blur-sm transition-all"
                    onClick={() => setIsTooltipOpen(false)}
                  />

                  {/* Tiny Modal */}
                  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm p-5 bg-white border border-slate-200 shadow-2xl rounded-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Info className="w-4 h-4 text-brand" />
                        Calculation Rules
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsTooltipOpen(false)}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col p-3 bg-brand/5 rounded-lg border border-brand/10">
                        <span className="text-sm font-bold text-brand flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          Margin (Standard)
                        </span>
                        <span className="text-[13px] font-medium text-slate-600 leading-relaxed">
                          বিক্রয় মূল্যের <span className="text-[11px]">(Selling Price)</span> ওপর ভিত্তি করে লাভের হিসাব।
                        </span>
                        <div className="mt-2 bg-white/60 p-2 rounded border border-brand/10 text-xs font-mono text-slate-700 flex justify-center">
                          (Profit ÷ Selling Price) × 100
                        </div>
                      </div>

                      <div className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          Markup
                        </span>
                        <span className="text-[13px] font-medium text-slate-600 leading-relaxed">
                          কেনা মূল্যের <span className="text-[11px]">(Buying Price)</span> ওপর ভিত্তি করে লাভের হিসাব।
                        </span>
                        <div className="mt-2 bg-white p-2 rounded border border-slate-200 text-xs font-mono text-slate-700 flex justify-center">
                          (Profit ÷ Buying Price) × 100
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className={cn(
              "flex items-center justify-between md:justify-end gap-3 sm:gap-6 text-sm w-full md:w-auto",
              isLoss ? "text-error" : "text-success",
            )}
          >
            <div className="flex flex-col items-start md:items-end flex-1 md:flex-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Profit
              </span>
              <span className="font-bold text-base leading-none mt-1">
                ৳{profit}
              </span>
            </div>

            <div className="h-7 w-px bg-border"></div>

            <div className="flex flex-col items-start" title="Based on Selling Price">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Margin</span>
              <span className="font-bold leading-none mt-1">{margin}%</span>
            </div>
            
            <div className="h-7 w-px bg-border hidden sm:block"></div>
            
            <div className="flex flex-col items-start" title="Based on Buying Price">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Markup
              </span>
              <span className="font-bold leading-none mt-1">{markup}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
