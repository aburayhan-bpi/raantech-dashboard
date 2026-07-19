"use client";

import { Pagination } from "@/components/dashboard/pagination";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import StatsCard from "@/components/shared/StatsCard";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Icons } from "@/utils/icons";
import { getInitials } from "@/utils/nameTrim";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { motion } from "framer-motion";
import { Search, UserCheck2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const INITIAL_MOCK_USERS = [
  {
    id: 1,
    name: "Jon Menson",
    email: "example123@gmail.com",
    avatar: "https://i.pravatar.cc/150?u=1",
    plan: "Premium (Monthly)",
    joined: "Jun 10, 2026",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane.doe@example.com",
    avatar: "", // No avatar
    plan: "Free",
    joined: "Jun 11, 2026",
    status: "Blocked",
  },
  {
    id: 3,
    name: "Alice Smith",
    email: "alice@gmail.com",
    avatar: "https://i.pravatar.cc/150?u=3",
    plan: "Premium (Monthly)",
    joined: "Jun 12, 2026",
    status: "Active",
  },
  {
    id: 4,
    name: "Bob Johnson",
    email: "bob.j@example.com",
    avatar: "", // No avatar
    plan: "Free",
    joined: "Jun 13, 2026",
    status: "Active",
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie@gmail.com",
    avatar: "https://i.pravatar.cc/150?u=5",
    plan: "Premium (Monthly)",
    joined: "Jun 14, 2026",
    status: "Active",
  },
  {
    id: 6,
    name: "Diana Prince",
    email: "diana@example.com",
    avatar: "",
    plan: "Premium (Yearly)",
    joined: "Jun 15, 2026",
    status: "Blocked",
  },
  {
    id: 7,
    name: "Evan Wright",
    email: "evan@gmail.com",
    avatar: "https://i.pravatar.cc/150?u=7",
    plan: "Free",
    joined: "Jun 16, 2026",
    status: "Active",
  },
  {
    id: 8,
    name: "Fiona Gallagher",
    email: "fiona@example.com",
    avatar: "https://i.pravatar.cc/150?u=8",
    plan: "Premium (Monthly)",
    joined: "Jun 17, 2026",
    status: "Active",
  },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Blocked", value: "blocked" },
  { label: "Unavailable", value: "unavailable" },
  { label: "Deleted", value: "deleted" },
];

const USER_OPTIONS = [
  { label: "All Plan", value: "all" },
  { label: "Free", value: "free" },
  { label: "Premium (Monthly)", value: "premium (monthly)" },
  { label: "Premium (Yearly)", value: "premium (yearly)" },
];

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const searchParams = useSearchParams();
  const setParams = useSetParamsForPagination();

  // Users State
  const [users, setUsers] = useState(INITIAL_MOCK_USERS);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    userId: number | null;
  }>({
    open: false,
    userId: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [status, setStatus] = useState("all");
  const [userType, setUserType] = useState("all");
  const previousSearch = useRef(debouncedSearch);

  useEffect(() => {
    if (previousSearch.current === debouncedSearch) {
      return;
    }
    previousSearch.current = debouncedSearch;
    setParams({ search: debouncedSearch || null, page: "1" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setParams({ status: val === "all" ? null : val, page: "1" });
  };

  const handleUserTypeChange = (val: string) => {
    setUserType(val);
    setParams({ plan: val === "all" ? null : val, page: "1" });
  };

  const handleToggleBlockClick = (userId: number) => {
    setConfirmModal({ open: true, userId });
  };

  const confirmToggleBlock = async () => {
    if (confirmModal.userId === null) return;
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setUsers((prev) =>
      prev.map((u) =>
        u.id === confirmModal.userId
          ? { ...u, status: u.status === "Blocked" ? "Active" : "Blocked" }
          : u,
      ),
    );

    setIsLoading(false);
    setConfirmModal({ open: false, userId: null });
  };

  // Client-side filtering logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus =
      status === "all" || user.status.toLowerCase() === status.toLowerCase();

    const matchesPlan =
      userType === "all" || user.plan.toLowerCase() === userType.toLowerCase();

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Pagination State from URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="w-full min-h-screen flex flex-col min-w-0 pb-10">
      {/* Top Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total User"
          value="11250"
          icon="HiUserGroup"
          variant="outlined"
          subText="vs last month"
          subTextNode={
            <span className="text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full text-xs font-medium">
              +311 user
            </span>
          }
          cardClass="bg-[#1b1b1b] border-white/10 text-white shadow-md rounded-2xl p-5"
          titleClass="text-gray-400 font-medium"
          valueClass="text-3xl mt-1 text-white"
          iconWrapperClass="bg-transparent"
          iconClass="text-gray-300 w-6 h-6"
        />
        <StatsCard
          title="Active User"
          value="3541"
          icon="UserRoundCheck"
          variant="outlined"
          subText="vs previous day"
          subTextNode={
            <span className="text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full text-xs font-medium">
              +38 user
            </span>
          }
          cardClass="bg-[#1b1b1b] border-white/10 text-white shadow-md rounded-2xl p-5"
          titleClass="text-gray-400 font-medium"
          valueClass="text-3xl mt-1 text-white"
          iconWrapperClass="bg-transparent"
          iconClass="text-green-500 w-6 h-6"
        />
        <StatsCard
          title="Paid User"
          value="248"
          icon="TbUserDollar"
          variant="outlined"
          subText="vs last month"
          subTextNode={
            <span className="text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full text-xs font-medium">
              +28 user
            </span>
          }
          cardClass="bg-[#1b1b1b] border-white/10 text-white shadow-md rounded-2xl p-5"
          titleClass="text-gray-400 font-medium"
          valueClass="text-3xl mt-1 text-white"
          iconWrapperClass="bg-transparent"
          iconClass="text-brand w-6 h-6"
        />
        <StatsCard
          title="Blocked User"
          value="214"
          icon="RiUserForbidLine"
          variant="outlined"
          subText="vs last month"
          subTextNode={
            <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full text-xs font-medium">
              -2 user
            </span>
          }
          cardClass="bg-[#1b1b1b] border-white/10 text-white shadow-md rounded-2xl p-5"
          titleClass="text-gray-400 font-medium"
          valueClass="text-3xl mt-1 text-white"
          iconWrapperClass="bg-transparent"
          iconClass="text-red-500 w-6 h-6"
        />
      </div>

      {/* Main List Section */}
      <div className="bg-[#1b1b1b] rounded-2xl border border-white/5 p-4 sm:p-6 shadow-xl flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10">
            <Icons.HiUserGroup className="text-brand w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white">All User List</h2>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#242424] border border-white/10 rounded-full focus:outline-none focus:border-brand/50 text-sm text-white placeholder-gray-500 transition-all"
            />
          </div>
          {/* Dropdowns */}
          <div className="flex items-center gap-3">
            <div className="w-35">
              <CustomDropdown
                options={STATUS_OPTIONS}
                value={status}
                onChange={handleStatusChange}
                triggerClassName="bg-transparent border-white/10 text-gray-300 rounded-full py-3 hover:bg-white/5 hover:border-white/20"
                dropdownClassName="bg-background/10 backdrop-blur-sm border-white/10"
                optionClassName="hover:bg-white/10 text-gray-300 hover:text-white"
              />
            </div>
            <div className="w-35">
              <CustomDropdown
                options={USER_OPTIONS}
                value={userType}
                onChange={handleUserTypeChange}
                triggerClassName="bg-transparent border-white/10 text-gray-300 rounded-full py-3 hover:bg-white/5 hover:border-white/20"
                dropdownClassName="bg-background/10 backdrop-blur-sm border-white/10"
                optionClassName="hover:bg-white/10 text-gray-300 hover:text-white"
              />
            </div>
          </div>
        </div>

        {/* Table/List */}
        <div className="flex-1 overflow-x-auto w-full custom-scrollbar pb-4">
          <table className="min-w-250 w-full text-left border-separate border-spacing-y-3">
            {/* Header */}
            <thead>
              <tr className="text-sm font-medium text-gray-400">
                <th className="px-6 pb-2 border-b border-white/10 font-medium">
                  User Profile
                </th>
                <th className="px-2 pb-2 border-b border-white/10 font-medium">
                  Current Plan
                </th>
                <th className="px-2 pb-2 border-b border-white/10 font-medium">
                  Joining Date
                </th>
                <th className="px-2 pb-2 border-b border-white/10 font-medium">
                  Status
                </th>
                <th className="px-6 pb-2 border-b border-white/10 font-medium text-right">
                  Action
                </th>
              </tr>
            </thead>

            {/* List Body */}
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-gray-500 font-medium"
                  >
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                    key={user.id}
                    className="bg-[#242424] group"
                  >
                    {/* User Profile */}
                    <td className="px-4 py-3 rounded-l-xl border-y border-l border-white/5 group-hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand/20 shrink-0 overflow-hidden relative flex items-center justify-center">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-brand uppercase">
                              {getInitials(user.name)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-white truncate">
                            {user.name}
                          </span>
                          <span className="text-sm text-gray-400 truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-2 py-3 border-y border-white/5 group-hover:border-white/10 transition-colors">
                      <div className="flex items-center">
                        <span
                          className={cn(
                            "font-semibold",
                            user.plan.includes("Premium")
                              ? "golden-gradient-text"
                              : "text-white",
                          )}
                        >
                          {user.plan}
                        </span>
                      </div>
                    </td>

                    {/* Joining Date */}
                    <td className="px-2 py-3 border-y border-white/5 group-hover:border-white/10 transition-colors">
                      <div className="flex items-center text-sm text-gray-400">
                        {user.joined}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-2 py-3 border-y border-white/5 group-hover:border-white/10 transition-colors">
                      <div className="flex items-center">
                        <div
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-full border w-fit",
                            user.status === "Blocked"
                              ? "bg-red-500/10 border-red-500/20"
                              : "bg-green-500/10 border-green-500/20",
                          )}
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              user.status === "Blocked"
                                ? "bg-red-500"
                                : "bg-green-500",
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs font-medium",
                              user.status === "Blocked"
                                ? "text-red-500"
                                : "text-green-500",
                            )}
                          >
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 rounded-r-xl border-y border-r border-white/5 group-hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === "Blocked" ? (
                          <button
                            title="Unblock User"
                            onClick={() => handleToggleBlockClick(user.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#22c55e] hover:bg-green-600 transition-colors text-white text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <UserCheck2 className="w-4 h-4 shrink-0" />
                          </button>
                        ) : (
                          <button
                            title="Block User"
                            onClick={() => handleToggleBlockClick(user.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f43f5e] hover:bg-rose-600 transition-colors text-white text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Icons.RiUserForbidLine className="w-4 h-4 shrink-0" />
                          </button>
                        )}
                        <Link
                          href={`/dashboard/admin/users/${user.id}`}
                          title="View User"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Icons.TbUserCircle className="w-4 h-4 shrink-0" />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title={
          users.find((u) => u.id === confirmModal.userId)?.status === "Blocked"
            ? "Unblock User"
            : "Block User"
        }
        description={
          users.find((u) => u.id === confirmModal.userId)?.status === "Blocked"
            ? "Are you sure you want to unblock this user? They will regain access to their account."
            : "Are you sure you want to block this user? They will immediately lose access to their account."
        }
        confirmText={
          users.find((u) => u.id === confirmModal.userId)?.status === "Blocked"
            ? "Unblock"
            : "Block"
        }
        tone={
          users.find((u) => u.id === confirmModal.userId)?.status === "Blocked"
            ? "default"
            : "danger"
        }
        loading={isLoading}
        onConfirm={confirmToggleBlock}
        onClose={() => setConfirmModal({ open: false, userId: null })}
      />
    </div>
  );
}
