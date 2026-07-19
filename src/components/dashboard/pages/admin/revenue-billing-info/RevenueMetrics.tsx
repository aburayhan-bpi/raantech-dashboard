"use client";

import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";

export function RevenueMetrics() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 bg-card rounded-3xl p-6 border-l border-t border-foreground/30 relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-muted-foreground font-semibold">Total Revenue</h3>
          <Icons.RiExchangeDollarLine className="w-5 h-5 text-foreground" />
        </div>
        <div className="text-3xl font-bold text-foreground mb-3">$2013</div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">vs last month</span>
          <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-md font-semibold text-xs">
            +25%
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 bg-card rounded-3xl p-6 border-l border-t border-foreground/30 relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-muted-foreground font-semibold">Paid User</h3>
          <Icons.TbUserDollar className="w-5 h-5 text-brand" />
        </div>
        <div className="text-3xl font-bold text-foreground mb-3">248</div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">vs last month</span>
          <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-md font-semibold text-xs">
            +311 user
          </span>
        </div>
      </motion.div>
    </div>
  );
}
