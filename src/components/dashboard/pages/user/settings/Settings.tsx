"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import ProfileTab from "./tabs/ProfileTab";

import PaymentTab from "./tabs/PaymentTab";
import PolicyTab from "./tabs/PolicyTab";
import SecurityTab from "./tabs/SecurityTab";

type TabType =
  | "Profile"
  | "Security & Privacy"
  | "Payment & Billing"
  | "Policy & Agreement";
const TABS: TabType[] = [
  "Profile",
  "Security & Privacy",
  "Payment & Billing",
  "Policy & Agreement",
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>("Profile");

  return (
    <div className="w-full h-full flex flex-col space-y-8 min-w-0">
      {/* Tabs */}
      <div className="flex items-center justify-start md:justify-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-1 w-full">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border text-sm transition-all hover:cursor-pointer whitespace-nowrap shrink-0",
                isActive
                  ? "golden-gradient-border border-transparent bg-transparent"
                  : "border-border text-muted-foreground hover:bg-white/5",
              )}
            >
              <span
                className={
                  isActive
                    ? "golden-gradient-text font-semibold"
                    : "font-medium"
                }
              >
                {tab}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-2xl mx-auto mt-8 min-w-0 px-0">
        {activeTab === "Profile" && <ProfileTab />}
        {activeTab === "Security & Privacy" && <SecurityTab />}
        {activeTab === "Payment & Billing" && <PaymentTab />}
        {activeTab === "Policy & Agreement" && <PolicyTab />}
      </div>
    </div>
  );
}
