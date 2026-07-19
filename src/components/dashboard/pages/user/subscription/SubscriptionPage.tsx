"use client";

import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <div className="w-full h-full flex flex-col min-w-0">
      <div className="flex flex-col items-center justify-center pt-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-3 mb-12"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-sm">
            Upgrade to unlock full AI analysis
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center items-stretch">
          {/* Free Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1 w-full max-w-95 mx-auto bg-muted-foreground/10 rounded-28 border border-muted-foreground/15 p-8 flex flex-col shadow-lg"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Free</h2>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-5xl font-bold text-foreground leading-none">
                0$
              </span>
              <span className="text-muted-foreground text-sm mb-1">/month</span>
            </div>

            <div className="w-full h-px bg-white/10 mb-8" />

            <div className="flex-1 flex flex-col gap-4 mb-10">
              {[
                "5 stocks on watchlist",
                "Basic AI signals (delayed)",
                "End-of-day price alerts (3 max)",
                "Daily market summary",
                "Community forum access",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icons.HiCheckBadge className="w-5 h-5 text-foreground shrink-0" />
                  <span className="text-sm text-gray-300 leading-tight">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <button
              disabled
              className="w-full py-4 rounded-xl bg-muted-foreground/10 text-muted-foreground font-semibold cursor-not-allowed mt-auto"
            >
              Current Plan
            </button>
          </motion.div>

          {/* Premium Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex-1 w-full max-w-95 mx-auto relative isolate rounded-28 shadow-2xl overflow-hidden bg-brand/5"
          >
            {/* Background Grid Image */}
            <div className="absolute inset-0 bg-[url('/subscription_card_bg_grid.png')] bg-cover bg-center -z-20" />

            {/* Top Right Brand Glow */}
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(255, 212, 81, 0.35) 0%, transparent 60%)",
              }}
            />

            {/* Border / Ring */}
            <div className="absolute inset-0 rounded-28 ring-1 ring-inset ring-brand/30 pointer-events-none" />

            <div className="p-8 flex flex-col h-full w-full relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-brand fill-brand" />
                <h2 className="text-xl font-bold golden-gradient-text">
                  Premium
                </h2>
              </div>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-5xl font-bold text-foreground leading-none">
                  120$
                </span>
                <span className="text-muted-foreground text-sm mb-1">
                  /month
                </span>
              </div>

              <div className="w-full h-px bg-brand/20 mb-8" />

              <div className="flex-1 flex flex-col gap-4 mb-10">
                {[
                  "Unlimited watchlist",
                  "Real-time AI buy/sell signals",
                  "Unlimited instant alerts",
                  "Multi-timeframe S/R analysis",
                  "AI price target projections",
                  "Volume confirmation signals",
                  "Momentum & trend scoring",
                  "Premium Discord community",
                  "Priority email support",
                  "API access (coming soon)",
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icons.HiCheckBadge className="w-5 h-5 text-brand shrink-0" />
                    <span className="text-sm text-foreground leading-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 border-none! golden-gradient-card text-yellow-700 font-bold hover:opacity-90 transition-all duration-200 shadow-[0_0_20px_rgba(255,212,81,0.3)] mt-auto cursor-pointer">
                Upgrade to Premium
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
