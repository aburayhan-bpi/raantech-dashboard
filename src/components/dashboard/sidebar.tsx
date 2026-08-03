"use client";
import { TPermission } from "@/types/global";
import type React from "react";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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
  onExpand?: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose, onExpand }: SidebarProps) {
  const pathname = usePathname();
  const user = useSelector(selectUser);

  // State to manage open accordions
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Auto-expand menus based on current pathname
  useEffect(() => {
    const prefix = `/dashboard/${(user?.role || "ADMIN").toLowerCase().replace("_", "-")}`;
    const newOpenMenus = { ...openMenus };
    let changed = false;

    SIDEBAR_ITEMS.forEach((item) => {
      if (item.subItems) {
        const hasActiveSub = item.subItems.some((sub) => {
          const fullHref = `${prefix}${sub.href}`;
          return pathname === fullHref || pathname.startsWith(`${fullHref}/`);
        });

        if (hasActiveSub && !newOpenMenus[item.id]) {
          newOpenMenus[item.id] = true;
          changed = true;
        }
      }
    });

    if (changed) {
      // eslint-disable-next-line
      setOpenMenus(newOpenMenus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user?.role]); // removed openMenus from dependencies to prevent infinite loops

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Get visible items based on user role and permissions
  const visibleItems = SIDEBAR_ITEMS.map((item) => {
    // 1. Role-based check for parent
    const hasRole = item.roles.includes(user?.role as unknown as TPermission);
    if (!hasRole) return null;

    let filteredSubItems = item.subItems;

    if (item.subItems) {
      filteredSubItems = item.subItems.filter((sub) => {
        const hasSubRole = sub.roles.includes(user?.role as unknown as TPermission);
        if (!hasSubRole) return false;

        if ((user?.role === "STAFF" || user?.role === "ADMIN") && user.permissions) {
          const permissionMap: Record<string, string> = {
            "/sales": "sales:view",
            "/purchases": "purchases:view",
            "/products": "products:view",
            "/categories": "categories:view",
            "/suppliers": "suppliers:view",
            "/customers": "customers:view",
            "/expenses": "expenses:view",
          };
          const requiredPermission = permissionMap[sub.href];
          if (requiredPermission) {
            return user.permissions.includes(requiredPermission as unknown as TPermission);
          }
        }
        return true;
      });

      if (filteredSubItems.length === 0) return null;
    } else {
      if ((user?.role === "STAFF" || user?.role === "ADMIN") && user.permissions && item.href) {
        const permissionMap: Record<string, string> = {};
        const requiredPermission = permissionMap[item.href];
        if (requiredPermission && !user.permissions.includes(requiredPermission as unknown as TPermission)) {
          return null;
        }
      }
    }

    return { ...item, subItems: filteredSubItems };
  }).filter(Boolean);

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      HiUserGroup: <Icons.HiUserGroup className="w-5 h-5" />,
      IoWallet: <Icons.IoWallet className="w-5 h-5" />,
      HiNewspaper: <Icons.HiNewspaper className="w-5 h-5" />,
      HiClipboardDocumentList: <Icons.HiClipboardDocumentList className="w-5 h-5" />,
      IoSettingsSharp: <Icons.IoSettingsSharp className="w-5 h-5" />,
      TbLayoutDashboardFilled: <Icons.TbLayoutDashboardFilled className="w-5 h-5" />,
      FaBookmark: <Icons.FaBookmark className="w-5 h-5" />,
      TbBellRingingFilled: <Icons.TbBellRingingFilled className="w-5 h-5" />,
      FaShoppingCart: <Icons.FaShoppingCart className="w-5 h-5" />,
      FaReceipt: <Icons.FaReceipt className="w-5 h-5" />,
      FaBoxOpen: <Icons.FaBoxOpen className="w-5 h-5" />,
      FaTags: <Icons.FaTags className="w-5 h-5" />,
      FaTruck: <Icons.FaTruck className="w-5 h-5" />,
      FaUsersCog: <Icons.FaUsersCog className="w-5 h-5" />,
      TbTrashFilled: <Icons.TbTrashFilled className="w-5 h-5" />,
    };
    return iconMap[iconName];
  };

  const prefix = `/dashboard/${(user?.role || "ADMIN").toLowerCase().replace("_", "-")}`;

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
              <Image
                draggable={false}
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
            <div className="space-y-6">
              {(() => {
                const groupedItems = visibleItems.reduce(
                  (acc, item) => {
                    if (!item) return acc;
                    const group = item.group || "OTHER";
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(item);
                    return acc;
                  },
                  {} as Record<string, typeof visibleItems>,
                );

                return Object.entries(groupedItems).map(([groupName, items]) => (
                  <div key={groupName} className="flex flex-col gap-2">
                    {/* Group Title */}
                    {!isCollapsed && (
                      <h4 className="px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400/80 mb-1">
                        {groupName}
                      </h4>
                    )}
                    {/* Items */}
                    <div className="space-y-1">
                      {items.map((item) => {
                        if (!item) return null;
                        
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isMenuOpen = openMenus[item.id] || false;
                        
                        // Check if any subitem is active
                        const isParentActive = hasSubItems
                          ? item.subItems!.some((sub) => {
                              const fullHref = `${prefix}${sub.href}`;
                              return pathname === fullHref || pathname.startsWith(`${fullHref}/`);
                            })
                          : false;

                        // Check if item itself is active
                        const fullHref = `${prefix}${item.href || ""}`;
                        const isItemActive = !hasSubItems && (pathname === fullHref || (item.href === "" && pathname === prefix));
                        
                        const isActive = isParentActive || isItemActive;

                        return (
                          <div key={item.id} className="flex flex-col relative group/sidebar-item">
                            {hasSubItems ? (
                              <button
                                onClick={() => {
                                  if (isCollapsed && onExpand) {
                                    onExpand();
                                    if (!openMenus[item.id]) {
                                      toggleMenu(item.id);
                                    }
                                  } else {
                                    toggleMenu(item.id);
                                  }
                                }}
                                title={isCollapsed ? item.label : undefined}
                                className={cn(
                                  "group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ease-out cursor-pointer relative overflow-hidden border-0",
                                  "text-[13px] font-medium w-full",
                                  isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800",
                                  isCollapsed && "lg:justify-center lg:px-0"
                                )}
                              >
                                <div className="flex items-center gap-3.5">
                                  <span
                                    className={cn(
                                      "shrink-0 transition-all duration-200 group-hover:scale-105",
                                      isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                                    )}
                                  >
                                    {getIcon(item.icon)}
                                  </span>
                                  {!isCollapsed && (
                                    <span className="transition-transform duration-200 truncate">
                                      {item.label}
                                    </span>
                                  )}
                                </div>
                                {!isCollapsed && (
                                  <ChevronDown
                                    className={cn(
                                      "w-4 h-4 transition-transform duration-200",
                                      isMenuOpen ? "rotate-180" : "",
                                      isActive ? "text-primary" : "text-slate-400"
                                    )}
                                  />
                                )}
                                {isCollapsed && hasSubItems && (
                                  <ChevronDown className="w-3 h-3 absolute right-1 opacity-50" />
                                )}
                              </button>
                            ) : (
                              <Link
                                href={fullHref}
                                onClick={() => {
                                  if (window.innerWidth < 1024) onClose();
                                }}
                                title={isCollapsed ? item.label : undefined}
                                className={cn(
                                  "group flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 ease-out cursor-pointer relative overflow-hidden border-0",
                                  "text-[13px] font-medium",
                                  isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800",
                                  isCollapsed && "lg:justify-center lg:px-0"
                                )}
                              >
                                <span
                                  className={cn(
                                    "shrink-0 transition-all duration-200 group-hover:scale-105",
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                                  )}
                                >
                                  {getIcon(item.icon)}
                                </span>
                                {!isCollapsed && (
                                  <span className="transition-transform duration-200 truncate">
                                    {item.label}
                                  </span>
                                )}
                              </Link>
                            )}

                            {/* Sub Items Rendering */}
                            {hasSubItems && !isCollapsed && (
                              <div
                                className={cn(
                                  "grid transition-all duration-300 ease-in-out",
                                  isMenuOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                                )}
                              >
                                <div className="overflow-hidden">
                                  <div className="flex flex-col relative pb-1">
                                    {item.subItems!.map((sub, index, arr) => {
                                      const isLast = index === arr.length - 1;
                                      const subFullHref = `${prefix}${sub.href}`;
                                      const isSubActive = pathname === subFullHref || pathname.startsWith(`${subFullHref}/`);
                                      
                                      return (
                                        <div key={sub.id} className="relative py-[2px]">
                                          {/* Main vertical line (only for non-last items, spanning full height to connect to next) */}
                                          {!isLast && (
                                            <div 
                                              className="absolute left-[25px] top-0 bottom-0 border-l border-slate-300"
                                            />
                                          )}
                                          {/* Curved connection line (Elbow) */}
                                          <div 
                                            className="absolute left-[25px] top-0 w-[14px] h-[50%] border-l border-b border-slate-300 rounded-bl-md"
                                          />
                                          
                                          <Link
                                            href={subFullHref}
                                            onClick={() => {
                                              if (window.innerWidth < 1024) onClose();
                                            }}
                                            className={cn(
                                              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-[13px] relative z-10 ml-[42px] mr-4",
                                              isSubActive
                                                ? "bg-slate-100/60 font-medium text-primary"
                                                : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                            )}
                                          >
                                            {sub.icon && (
                                              <span className={isSubActive ? "text-primary" : "text-slate-400"}>
                                                {getIcon(sub.icon)}
                                              </span>
                                            )}
                                            <span className="truncate">{sub.label}</span>
                                          </Link>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
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
