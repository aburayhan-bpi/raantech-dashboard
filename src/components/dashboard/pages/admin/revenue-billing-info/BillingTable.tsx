"use client";

import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { motion } from "framer-motion";
import { Download, ReceiptText, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

const DUMMY_DATA = [
  {
    id: 1,
    name: "Jon Menson",
    email: "example123@gmail.ocm",
    transactionId: "pi_3Nxj8h2eZvKYlo2C0X7d5fG9",
    planName: "Premium (Monthly)",
    date: "Jun 10, 2026",
    status: "Pending",
  },
  {
    id: 2,
    name: "Jon Menson",
    email: "example123@gmail.ocm",
    transactionId: "pi_3Nxj8h2eZvKYlo2C0X7d5fG9",
    planName: "Premium (Monthly)",
    date: "Jun 10, 2026",
    status: "Paid",
  },
  {
    id: 3,
    name: "Jon Menson",
    email: "example123@gmail.ocm",
    transactionId: "pi_3Nxj8h2eZvKYlo2C0X7d5fG9",
    planName: "Premium (Monthly)",
    date: "Jun 10, 2026",
    status: "Paid",
  },
  {
    id: 4,
    name: "Jon Menson",
    email: "example123@gmail.ocm",
    transactionId: "pi_3Nxj8h2eZvKYlo2C0X7d5fG9",
    planName: "Premium (Monthly)",
    date: "Jun 10, 2026",
    status: "Paid",
  },
  {
    id: 5,
    name: "Jon Menson",
    email: "example123@gmail.ocm",
    transactionId: "pi_3Nxj8h2eZvKYlo2C0X7d5fG9",
    planName: "Premium (Monthly)",
    date: "Jun 10, 2026",
    status: "Failed",
  },
  {
    id: 6,
    name: "Jon Menson",
    email: "example123@gmail.ocm",
    transactionId: "pi_3Nxj8h2eZvKYlo2C0X7d5fG9",
    planName: "Premium (Monthly)",
    date: "Jun 10, 2026",
    status: "Paid",
  },
];

export function BillingTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const STATUS_OPTIONS = [
    { label: "All Status", value: "all" },
    { label: "Paid", value: "Paid" },
    { label: "Pending", value: "Pending" },
    { label: "Failed", value: "Failed" },
  ];

  const USER_OPTIONS = [
    { label: "All User", value: "all" },
    { label: "Premium", value: "Premium" },
    { label: "Basic", value: "Basic" },
  ];

  const filteredData = useMemo(() => {
    return DUMMY_DATA.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      // Since user filter doesn't perfectly map to dummy data, just mock it or don't filter.
      const matchesUser =
        userFilter === "all" || item.planName.includes(userFilter);

      return matchesSearch && matchesStatus && matchesUser;
    });
  }, [searchTerm, statusFilter, userFilter]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/10 text-green-500";
      case "Failed":
        return "bg-red-500/10 text-red-500";
      case "Pending":
      default:
        return "bg-gray-500/10 text-gray-400";
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
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6">
        <ReceiptText className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-white">
          Billing Information
        </h2>
      </div>

      {/* Toolbar Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="relative w-full lg:w-105">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-32 lg:w-40">
            <CustomDropdown
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              triggerClassName="bg-background border-white/10 text-muted-foreground rounded-full py-2.5 hover:bg-white/5"
              dropdownClassName="bg-background/10 backdrop-blur-sm border-white/10"
              optionClassName="hover:bg-white/10 text-muted-foreground hover:text-white"
            />
          </div>
          <div className="w-32 lg:w-40">
            <CustomDropdown
              options={USER_OPTIONS}
              value={userFilter}
              onChange={setUserFilter}
              triggerClassName="bg-background border-white/10 text-muted-foreground rounded-full py-2.5 hover:bg-white/5"
              dropdownClassName="bg-background/10 backdrop-blur-sm border-white/10"
              optionClassName="hover:bg-white/10 text-muted-foreground hover:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto w-full custom-scrollbar pb-4">
        <table className="w-full min-w-max border-collapse border-spacing-y-3">
          {/* Table Headers */}
          <thead>
            <tr className="text-left text-xs font-medium text-muted-foreground border-b border-white/10">
              <th className="font-medium pb-3 px-6">User Profile</th>
              <th className="font-medium pb-3 px-6">Transaction ID</th>
              <th className="font-medium pb-3 px-6">Plan Name</th>
              <th className="font-medium pb-3 px-6">Date</th>
              <th className="font-medium pb-3 px-6">Status</th>
              <th className="font-medium pb-3 px-6 text-right">Action</th>
            </tr>
          </thead>

          {/* Table Rows */}
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground font-medium"
                >
                  No billing records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredData.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-background group hover:bg-white/5 transition-colors"
                >
                  {/* User Profile */}
                  <td className="p-4 lg:px-6 rounded-l-3xl border-y border-l border-white/5 group-hover:border-white/10">
                    <div className="flex items-center gap-3 w-full min-w-52">
                      <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0 relative">
                        <Image
                          src="/icon2.png"
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-white text-sm truncate">
                          {item.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {item.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Transaction ID */}
                  <td className="p-4 lg:px-6 border-y border-white/5 group-hover:border-white/10">
                    <div className="w-full min-w-52">
                      <span className="lg:hidden text-xs text-muted-foreground mb-1 block">
                        Transaction ID
                      </span>
                      <span className="text-sm text-muted-foreground truncate block">
                        {item.transactionId}
                      </span>
                    </div>
                  </td>

                  {/* Plan Name */}
                  <td className="p-4 lg:px-6 border-y border-white/5 group-hover:border-white/10">
                    <div className="w-full min-w-40">
                      <span className="lg:hidden text-xs text-muted-foreground mb-1 block">
                        Plan Name
                      </span>
                      <span className="text-sm font-semibold text-yellow-500 truncate block">
                        {item.planName}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="p-4 lg:px-6 border-y border-white/5 group-hover:border-white/10">
                    <div className="w-full min-w-32">
                      <span className="lg:hidden text-xs text-muted-foreground mb-1 block">
                        Date
                      </span>
                      <span className="text-sm text-muted-foreground truncate block">
                        {item.date}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4 lg:px-6 border-y border-white/5 group-hover:border-white/10">
                    <div className="flex items-center w-full min-w-24">
                      <span className="lg:hidden text-xs text-muted-foreground block mr-2">
                        Status
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                          item.status,
                        )}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${getStatusDot(
                            item.status,
                          )}`}
                        />
                        {item.status}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-4 lg:px-6 rounded-r-3xl border-y border-r border-white/5 group-hover:border-white/10 text-right">
                    <div className="flex justify-end w-full min-w-32">
                      <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer shrink-0">
                        <Download className="w-4 h-4" />
                        SVG
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
