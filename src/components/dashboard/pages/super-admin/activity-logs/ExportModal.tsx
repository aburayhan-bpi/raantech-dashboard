import React, { useState } from "react";
import { X, Download, FileSpreadsheet } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { CustomDropdown } from "@/components/shared/CustomDropdown";

const TIMEFRAME_OPTIONS = [
  { value: "0", label: "Today" },
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Date Range" },
];

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: {
    search: string | null;
    entityType: string | null;
    action: string | null;
  };
}

export default function ExportModal({ isOpen, onClose, currentFilters }: ExportModalProps) {
  const [timeframe, setTimeframe] = useState("7");
  const [formatType, setFormatType] = useState("csv");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const queryParams = new URLSearchParams();
      
      if (currentFilters.search) queryParams.set("search", currentFilters.search);
      if (currentFilters.entityType) queryParams.set("entityType", currentFilters.entityType);
      if (currentFilters.action) queryParams.set("action", currentFilters.action);

      // Handle Dates
      if (timeframe === "custom") {
        if (customStartDate) queryParams.set("startDate", customStartDate);
        if (customEndDate) queryParams.set("endDate", customEndDate);
      } else if (timeframe !== "all") {
        const days = parseInt(timeframe);
        const start = startOfDay(subDays(new Date(), days));
        const end = endOfDay(new Date());
        queryParams.set("startDate", start.toISOString());
        queryParams.set("endDate", end.toISOString());
      }

      // Format
      queryParams.set("format", formatType); // In case backend handles PDF in future, for now it returns CSV

      const exportUrl = `/api/v1/activity-logs/export?${queryParams.toString()}`;
      
      // Trigger download
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_logs_${format(new Date(), "yyyy-MM-dd")}.${formatType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export logs. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Download className="w-5 h-5 text-[#0089A7]" />
            <h2 className="text-lg font-semibold">Export Logs</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Timeframe */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Timeframe</label>
            <CustomDropdown
              options={TIMEFRAME_OPTIONS}
              value={timeframe}
              onChange={(val) => setTimeframe(val)}
              placeholder="Select Timeframe"
              className="w-full bg-slate-50 border-slate-200"
            />
          </div>

          {/* Custom Date Range */}
          {timeframe === "custom" && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">From Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">To Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"
                />
              </div>
            </div>
          )}

          {/* Format */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormatType("csv")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  formatType === "csv"
                    ? "border-[#0089A7] bg-[#0089A7]/5 text-[#0089A7]"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV/Excel
              </button>
              <button
                onClick={() => setFormatType("pdf")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  formatType === "pdf"
                    ? "border-[#0089A7] bg-[#0089A7]/5 text-[#0089A7]"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                PDF
              </button>
            </div>
            <p className="text-xs text-slate-500">
              CSV files can be opened seamlessly in Microsoft Excel or Google Sheets.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || (timeframe === "custom" && (!customStartDate || !customEndDate))}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
