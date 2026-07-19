"use client";

import { cn } from "@/lib/utils";
import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const INVOICE_HISTORY = [
  {
    id: 1,
    date: "22 Dec 2026",
    plan: "Premium Plan",
    frequency: "Yearly",
    price: "$99.99",
    status: "Paid",
  },
  {
    id: 2,
    date: "22 Dec 2026",
    plan: "Premium Plan",
    frequency: "Monthly",
    price: "$9.99",
    status: "Failed",
  },
  {
    id: 3,
    date: "22 Dec 2026",
    plan: "Premium Plan",
    frequency: "Monthly",
    price: "$9.99",
    status: "Pending",
  },
  {
    id: 4,
    date: "22 Dec 2026",
    plan: "Premium Plan",
    frequency: "Monthly",
    price: "$9.99",
    status: "Paid",
  },
];

function UserInfoCard() {
  return (
    <div className="bg-card rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center">
      <div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative ring-4 ring-white/5">
        <Image
          src="/icon2.png"
          alt="Hamid Hasan"
          fill
          className="object-cover"
        />
      </div>
      <h2 className="text-xl font-bold text-white mb-1">Hamid Hasan</h2>
      <p className="text-muted-foreground text-sm">example123@gmail.com</p>
    </div>
  );
}

function CurrentPlanCard() {
  return (
    <div className="bg-card rounded-3xl p-6 border border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <Icons.PiCubeFocusLight className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Current Plan</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-foreground/10 px-4 py-2 rounded-xl text-sm font-medium text-foreground/70 shadow-sm border border-white/5">
          Free plan
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-sm text-success font-medium">Active</span>
        </div>
      </div>
    </div>
  );
}

function InvoiceHistoryCard() {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/10 text-green-500";
      case "Failed":
        return "bg-red-500/10 text-red-500";
      case "Pending":
      default:
        return "bg-white/10 text-gray-400";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500";
      case "Failed":
        return "bg-red-500";
      case "Pending":
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 border border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <Icons.FaReceipt className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Invoice History</h3>
      </div>

      <div className="w-full flex flex-col">
        {INVOICE_HISTORY.map((invoice, i) => (
          <div
            key={invoice.id}
            className={cn(
              "flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-white/5 gap-4",
              i === INVOICE_HISTORY.length - 1 && "border-0 pb-2",
            )}
          >
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              <span className="text-sm text-muted-foreground truncate">
                {invoice.date}
              </span>
              <span className="text-sm font-semibold text-yellow-500 truncate">
                {invoice.plan}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {invoice.frequency}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {invoice.price}
              </span>
            </div>
            <div className="shrink-0 flex justify-end w-28">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                  invoice.status,
                )}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${getStatusDot(
                    invoice.status,
                  )}`}
                />
                {invoice.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserProfile() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <Link
        href="/dashboard/admin/users"
        className="flex items-center gap-2 text-muted-foreground hover:text-white hover:cursor-pointer w-fit transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium text-sm">User Profile</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        <UserInfoCard />
        <CurrentPlanCard />
        <InvoiceHistoryCard />
      </motion.div>
    </div>
  );
}
