"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Package, ReceiptText } from "lucide-react";
import Link from "next/link";

// Mock Data for Invoices
const invoices = [
  {
    id: 1,
    date: "22 Dec 2026",
    plan: "Premium Plan",
    cycle: "Yearly",
    amount: "$99.99",
    status: "Paid",
  },
  {
    id: 2,
    date: "22 Dec 2026",
    plan: "Premium Plan",
    cycle: "Monthly",
    amount: "$9.99",
    status: "Failed",
  },
  {
    id: 3,
    date: "22 Dec 2026",
    plan: "Premium Plan",
    cycle: "Monthly",
    amount: "$9.99",
    status: "Pending",
  },
  {
    id: 4,
    date: "22 Dec 2026",
    plan: "Premium Plan",
    cycle: "Monthly",
    amount: "$9.99",
    status: "Paid",
  },
];

export default function PaymentTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Current Plan Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col w-full max-w-2xl mx-auto shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-5 h-5 text-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            Current Plan
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="px-5 py-2.5 rounded-full bg-white/5 border border-border text-foreground font-medium text-sm">
              Free plan
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm font-medium text-success">Active</span>
            </div>
          </div>

          <Link
            href="/dashboard/user/subscription"
            className="px-8 py-2.5 rounded-xl golden-gradient-card border-none! text-primary-foreground font-semibold hover:opacity-90 transition-all duration-200 hover:cursor-pointer shadow-md"
          >
            Upgrade
          </Link>
        </div>
      </div>

      {/* Invoice History Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col w-full max-w-2xl mx-auto shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <ReceiptText className="w-5 h-5 text-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            Invoice History
          </h2>
        </div>

        <div className="flex flex-col w-full">
          {invoices.map((invoice, index) => (
            <div
              key={invoice.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5",
                index !== invoices.length - 1 && "border-b border-border",
              )}
            >
              {/* Date */}
              <div className="w-full sm:w-30 text-sm font-medium text-muted-foreground shrink-0">
                {invoice.date}
              </div>

              {/* Plan Name */}
              <div className="w-full sm:w-32.5 text-sm font-semibold golden-gradient-text shrink-0">
                {invoice.plan}
              </div>

              {/* Cycle */}
              <div className="w-full sm:w-20 text-sm text-muted-foreground shrink-0">
                {invoice.cycle}
              </div>

              {/* Amount */}
              <div className="w-full sm:w-20 text-sm text-muted-foreground shrink-0">
                {invoice.amount}
              </div>

              {/* Status Badge */}
              <div className="w-full sm:w-25 flex sm:justify-end shrink-0">
                <div
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium w-fit",
                    invoice.status === "Paid" && "bg-success/10 text-success",
                    invoice.status === "Failed" && "bg-error/10 text-error",
                    invoice.status === "Pending" &&
                      "bg-white/5 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      invoice.status === "Paid" && "bg-success",
                      invoice.status === "Failed" && "bg-error",
                      invoice.status === "Pending" && "bg-muted-foreground",
                    )}
                  />
                  {invoice.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
