/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { SIDEBAR_ITEMS, WEBSITE_DETAILS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { selectUser } from "@/redux/features/user/authSlice";
import { Icons } from "@/utils/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { LogoutButton } from "./LogoutButton";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useSelector(selectUser);

  // Get visible items based on user role and permissions
  const visibleItems = SIDEBAR_ITEMS.filter((item) => {
    // 1. Role-based check
    const hasRole = item.roles.includes(user?.role as any);
    if (!hasRole) return false;

    // 2. Permission-based check for STAFF and ADMIN
    if ((user?.role === "STAFF" || user?.role === "ADMIN") && user.permissions) {
      // Create a mapping of route paths to required permissions
      const permissionMap: Record<string, string> = {
        "/sales": "sales:view",
        "/products": "products:view",
        "/categories": "categories:view",
        "/customers": "customers:view",
        "/expenses": "expenses:view",
      };

      const requiredPermission = permissionMap[item.href];

      // If there's a required permission for this route, check if user has it
      if (requiredPermission) {
        return user.permissions.includes(requiredPermission);
      }
    }

    return true;
  });

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      // Admin Dashboard
      HiUserGroup: <Icons.HiUserGroup className="w-5 h-5" />, // Page: User Management
      IoWallet: <Icons.IoWallet className="w-5 h-5" />, // Page: Plan Management
      HiNewspaper: <Icons.HiNewspaper className="w-5 h-5" />, // Page: Revenue & Billing Info
      HiClipboardDocumentList: (
        <Icons.HiClipboardDocumentList className="w-5 h-5" />
      ), // Page: Edit Policy & Agreement
      IoSettingsSharp: <Icons.IoSettingsSharp className="w-5 h-5" />, // Page: Admin Settings - User Dashboard + Admin Dashboard

      // User Dashboard
      TbLayoutDashboardFilled: (
        <Icons.TbLayoutDashboardFilled className="w-5 h-5" />
      ), // Page: User Home
      FaBookmark: <Icons.FaBookmark className="w-5 h-5" />, // Page: User Watchlist
      TbBellRingingFilled: <Icons.TbBellRingingFilled className="w-5 h-5" />, // Page: User Alerts

      // Shared / General
      FaShoppingCart: <Icons.FaShoppingCart className="w-5 h-5" />,
      FaBoxOpen: <Icons.FaBoxOpen className="w-5 h-5" />,
      FaTags: <Icons.FaTags className="w-5 h-5" />,
      FaUsersCog: <Icons.FaUsersCog className="w-5 h-5" />,
    };
    return iconMap[iconName];
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-30 hover:cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar",
          "transition-all duration-300 z-40",
          "lg:relative lg:z-0 border-r border-sidebar-border shadow-[2px_0_8px_rgba(0,0,0,0.01)]",
          isOpen ? "w-64" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="h-20 flex flex-col items-center justify-center gap-2 px-6 border-b border-sidebar-border">
            <Link
              href="/dashboard/admin"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Image draggable={false}
                src={WEBSITE_DETAILS.SITE_LOGO}
                alt={WEBSITE_DETAILS.SITE_NAME}
                width={isCollapsed ? 36 : 70}
                height={isCollapsed ? 36 : 70}
                priority
                
                className="object-contain transition-all duration-300"
              />
            </Link>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
            <div className="space-y-4">
              {(() => {
                const groupedItems = visibleItems.reduce(
                  (acc, item) => {
                    const group = item.group || "OTHER";
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(item);
                    return acc;
                  },
                  {} as Record<string, typeof visibleItems>,
                );

                return Object.entries(groupedItems).map(
                  ([groupName, items]) => (
                    <div key={groupName} className="flex flex-col gap-1">
                      {/* Group Title */}
                      {!isCollapsed && (
                        <h4 className="px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400/80 mb-0.5">
                          {groupName}
                        </h4>
                      )}
                      {/* Items */}
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          const prefix = `/dashboard/${(user?.role || "ADMIN").toLowerCase().replace("_", "-")}`;
                          const fullHref = `${prefix}${item.href}`;
                          const isActive =
                            pathname === fullHref ||
                            (item.href === "" && pathname === prefix);
                          return (
                            <Link
                              key={item.id}
                              href={fullHref}
                              onClick={() => {
                                onClose();
                              }}
                              title={isCollapsed ? item.label : undefined}
                              className={cn(
                                "group flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 ease-out cursor-pointer relative overflow-hidden border-0",
                                "text-[13px]",
                                isActive
                                  ? "bg-[#0089A7] text-white font-medium shadow-md shadow-[#0089A7]/20"
                                  : "text-slate-500 font-medium hover:bg-slate-100/80 hover:text-slate-800",
                                isCollapsed && "lg:justify-center lg:px-0",
                              )}
                            >
                              <span
                                className={cn(
                                  "shrink-0 transition-all duration-200 group-hover:scale-105",
                                  isActive
                                    ? "text-white"
                                    : "text-slate-400 group-hover:text-slate-600",
                                )}
                              >
                                {getIcon(item.icon)}
                              </span>
                              {!isCollapsed && (
                                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                                  {item.label}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ),
                );
              })()}
            </div>
          </nav>

          {/* User profile / Active Workspace details */}
          <div className="p-3 mt-auto border-t border-sidebar-border bg-sidebar-accent/20 flex flex-col gap-3">
            <LogoutButton isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
