"use client";

import { BillingTable } from "./BillingTable";
import { RevenueMetrics } from "./RevenueMetrics";

const RevenueBillingInfo = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <RevenueMetrics />
      <BillingTable />
    </div>
  );
};

export default RevenueBillingInfo;
