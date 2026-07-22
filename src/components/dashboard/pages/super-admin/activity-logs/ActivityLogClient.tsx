"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/authSlice";
import { useGetActivityLogsQuery } from "@/redux/api/activity-logs/activityLogApi";
import { useSearchParams } from "next/navigation";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { formatStatusText } from "@/utils/formatStatusText";
import { useDebounce } from "@/hooks/useDebounce";
import ExportModal from "./ExportModal";
import { format } from "date-fns";
import {
  Search,
  Loader2,
  Calendar,
  Activity,
  Layers,
  Clock,
  RefreshCcw,
  Download,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { IActivityLog } from "@/types/global";

const ENTITY_TYPES = ["USER", "PRODUCT", "CATEGORY", "SALE", "EXPENSE", "PROFILE"];
const ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "CREATED",
  "UPDATED",
  "DELETED",
  "RESTORED",
  "INVITED",
  "PASSWORD_CHANGE",
];

const ENTITY_OPTIONS = [
  { value: "", label: "All Entities" },
  ...ENTITY_TYPES.map(type => ({ value: type, label: formatStatusText(type) }))
];

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  ...ACTIONS.map(action => ({ value: action, label: formatStatusText(action) }))
];

export default function ActivityLogClient() {
  const currentUser = useSelector(selectUser);
  const searchParams = useSearchParams();
  const setParams = useSetParamsForPagination();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const previousSearch = useRef(debouncedSearch);

  const entityTypeFilter = searchParams.get("entityType") || "";
  const actionFilter = searchParams.get("action") || "";
  const startDateFilter = searchParams.get("startDate") || "";

  useEffect(() => {
    if (previousSearch.current === debouncedSearch) return;
    previousSearch.current = debouncedSearch;
    setParams({ search: debouncedSearch || null, page: "1" });
  }, [debouncedSearch, setParams]);

  const { data, isLoading, isError } = useGetActivityLogsQuery(searchParams.toString());
  const logs = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPage: 1 };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATED":
      case "INVITED":
      case "RESTORED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "UPDATED":
      case "PASSWORD_CHANGE":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "DELETED":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "LOGIN":
      case "LOGOUT":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((currentUser as any)?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-700">Access Denied</h2>
          <p className="text-slate-500">Only Super Admins can view activity logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Activity Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor and track system activities
          </p>
        </div>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative col-span-1 md:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] focus:bg-white transition-all"
          />
        </div>
        
        <div className="relative">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <CustomDropdown
            options={ENTITY_OPTIONS}
            value={entityTypeFilter}
            onChange={(val) => setParams({ entityType: val || null, page: "1" })}
            placeholder="All Entities"
            triggerClassName="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl text-sm"
          />
        </div>

        <div className="relative">
          <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <CustomDropdown
            options={ACTION_OPTIONS}
            value={actionFilter}
            onChange={(val) => setParams({ action: val || null, page: "1" })}
            placeholder="All Actions"
            triggerClassName="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 rounded-xl text-sm"
          />
        </div>

        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setParams({ startDate: e.target.value || null, page: "1" })}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] focus:bg-white transition-all cursor-pointer text-slate-700"
            />
          </div>
          {(searchTerm || entityTypeFilter || actionFilter || startDateFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setParams({ search: null, entityType: null, action: null, startDate: null, endDate: null, page: "1" });
              }}
              className="p-2.5 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors bg-white shadow-sm flex-shrink-0"
              title="Reset Filters"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr key="loading">
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0089A7]" />
                    Loading logs...
                  </td>
                </tr>
              ) : isError ? (
                <tr key="error">
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-red-500"
                  >
                    Failed to load activity logs. Please try again.
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr key="empty">
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No activity logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log: IActivityLog, index: number) => (
                  <tr
                    key={log._id || index}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm uppercase overflow-hidden relative border border-slate-200/60 shadow-sm group-hover:border-[#0089A7]/30 transition-colors">
                          {log.user?.profileImage && log.user.profileImage !== "/logo.png" ? (
                            <Image draggable={false} 
                              src={log.user.profileImage} 
                              alt={log.user.name || "User"} 
                              fill
                              className="object-cover" 
                            />
                          ) : (
                            (log.user?.name || "U").charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {log.user?.name || "Unknown User"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {log.user?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border",
                        getActionBadge(log.action)
                      )}>
                        {formatStatusText(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {formatStatusText(log.entityType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-slate-600 truncate" title={log.details}>
                        {log.details}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{format(new Date(log.createdAt), "MMM dd, yyyy")}</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span>{format(new Date(log.createdAt), "hh:mm a")}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {logs.length > 0 && meta.totalPage > 1 && (
          <div className="border-t border-slate-200/80 p-4">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPage}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
            />
          </div>
        )}
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentFilters={{
          search: searchParams.get("search"),
          entityType: searchParams.get("entityType"),
          action: searchParams.get("action"),
        }}
      />
    </div>
  );
}
