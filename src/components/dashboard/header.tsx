/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/utils";
import { useGetMeQuery } from "@/redux/api/getMe/getMeApi";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { setUser } from "@/redux/features/user/authSlice";

import { Icons } from "@/utils/icons";
import { useEffect, useRef, useState } from "react";
import { NotificationModal } from "./notification-modal";
import { formatStatusText } from "@/utils/formatStatusText";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export function Header({
  onMenuClick,
  sidebarOpen,
  isCollapsed,
  onCollapseToggle,
}: HeaderProps) {
  //   const router = useRouter();
  const isAuthenticated = useAuth();
  const user = useAppSelector((state) => state.auth.user);
  const { data: userData, refetch } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [pathname, isAuthenticated, refetch]);
  const profile = userData?.data as
    | {
        fullName?: string;
        name?: string;
        email?: string;
        role?: string;
        profileImage?: string;
        profilePicture?: string;
      }
    | undefined;

  const { handleLogout } = useLogout();

  const displayName = profile?.name || user?.name || "-";
  const displayRole = profile?.role ?? user?.role ?? "-";
  const displayEmail = profile?.email ?? user?.email ?? "-";
  const profileImage =
    profile?.profileImage || profile?.profilePicture || "/logo.png";

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync latest user permissions to Redux on every load/refresh
  useEffect(() => {
    if (userData?.data) {
      dispatch(setUser(userData.data));
    }
  }, [userData, dispatch]);

  const hasNotifications = true;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-background/80 border-b border-border/80 px-4 lg:px-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] backdrop-blur-md">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuClick}
          className={cn(
            "text-primary! hover:bg-primary/10! rounded-xl p-2 sm:p-2.5 transition-all duration-300 hover:cursor-pointer lg:hidden shrink-0",
            sidebarOpen
              ? "text-primary! bg-primary/10!"
              : "text-muted-foreground hover:bg-input",
          )}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <Icons.TbLayoutSidebarLeftCollapseFilled className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Icons.TbLayoutSidebarRightCollapseFilled className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>

        {/* Sidebar Collapse Toggle (Desktop) - Sleek Floating Circular Button */}
        <button
          onClick={onCollapseToggle}
          className="hidden lg:flex items-center justify-center size-8.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-sidebar-accent shadow-sm transition-all hover:cursor-pointer -ml-8.5 z-10 hover:scale-105 shrink-0"
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? (
            <Icons.TbLayoutSidebarRightCollapseFilled className="w-4.5 h-4.5 text-muted-foreground" />
          ) : (
            <Icons.TbLayoutSidebarLeftCollapseFilled className="w-4.5 h-4.5 text-muted-foreground" />
          )}
        </button>

        {/* Search Bar */}
        <div className="flex relative group w-full max-w-50 sm:max-w-md ml-1 sm:ml-4 flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icons.Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="search"
            placeholder="Search..."
            className="block w-full pl-9 pr-3 py-2.5 sm:py-2 bg-input border border-border rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground shadow-sm text-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4.5">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotification(!showNotification)}
            aria-label="Notifications"
            className="p-2.5 ml-2 -mr-2 md:ml-0 md:mr-0 text-muted-foreground rounded-lg border border-border bg-brand/10 backdrop-blur-lg shadow-[0_2px_4px_rgba(0,0,0,0.01)] hover:bg-sidebar-accent hover:text-foreground hover:border-border hover:cursor-pointer transition-all relative"
          >
            <Icons.Bell className="w-4.5 h-4.5 text-brand" />
            {hasNotifications && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white"></span>
              </span>
            )}
          </button>

          <NotificationModal
            isOpen={showNotification}
            onClose={() => setShowNotification(false)}
          />
        </div>

        {/* {profile?.role === IRole.VENDOR ? (
          <>
            <Link href="/dashboard/vendor/notification" className="relative">
              <button
                aria-label="Notifications"
                className="p-2 text-muted-foreground rounded-full border border-border bg-card/50 shadow-[0_2px_4px_rgba(0,0,0,0.01)] hover:bg-sidebar-accent hover:text-foreground hover:border-border hover:cursor-pointer transition-all relative"
              >
                <Icons.Bell className="w-4.5 h-4.5" />
                {hasNotifications && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white"></span>
                  </span>
                )}
              </button>
            </Link>
          </>
        ) : null} */}

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              "flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer",
              showDropdown && "bg-slate-100 border-slate-200",
            )}
            aria-expanded={showDropdown}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 rounded-full bg-[#0089A7]/10 flex items-center justify-center text-[#0089A7] font-bold shadow-inner border border-[#0089A7]/20 overflow-hidden relative">
              {profileImage && profileImage !== "/logo.png" ? (
                <Image draggable={false}
                  src={profileImage}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="hidden md:block text-left mr-1">
              <p className="text-sm font-bold text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-500 font-medium">
                {formatStatusText(user?.role || "USER")}
              </p>
            </div>
            <Icons.ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-slate-400 transition-transform ml-1",
                showDropdown && "rotate-180",
              )}
            />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
              <div className="p-4.5 border-b border-border bg-muted/50">
                <p className="text-sm font-bold text-foreground leading-none">
                  {displayName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground break-all leading-relaxed">
                  {displayEmail}
                </p>
              </div>

              {/* {profile?.role === "ADMIN" && (
                <>
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        router.push("/dashboard/admin/users");
                        setShowDropdown(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground hover:cursor-pointer transition-colors"
                    >
                      <Icons.Users className="w-4 h-4 text-muted-foreground" />
                      Users List
                    </button>
                    <button
                      onClick={() => {
                        router.push("/dashboard/admin/settings");
                        setShowDropdown(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground hover:cursor-pointer transition-colors"
                    >
                      <Icons.Settings className="w-4 h-4 text-muted-foreground" />
                      Account Settings
                    </button>
                  </div>
                </>
              )} */}

              {/* <div className="p-1.5 border-t border-border"> */}
              <div className="p-1.5 border-none border-border">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 hover:cursor-pointer rounded-xl px-3 py-2 text-sm text-error hover:bg-error-20 transition-colors"
                  aria-label="Log out"
                >
                  <Icons.LogOut className="w-4 h-4 text-error" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
