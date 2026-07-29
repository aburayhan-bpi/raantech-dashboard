import React, { Suspense } from "react";
import ActivityLogClient from "@/components/dashboard/pages/super-admin/activity-logs/ActivityLogClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Activity Logs | Raantech",
  description: "Monitor and track system activities",
};

export default function ActivityLogsPage() {
  return (
    <div className="p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0089A7]" />
        </div>
      }>
        <ActivityLogClient />
      </Suspense>
    </div>
  );
}