"use client";

import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/utils";
import { Icons } from "@/utils/icons";

export function LogoutButton({ isCollapsed }: { isCollapsed: boolean }) {
  const { handleLogout } = useLogout();

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "group w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-border bg-error/20 shadow-[0_2px_4px_rgba(0,0,0,0.01)] hover:bg-error-20 hover:text-error hover:border-error/50",
        "text-sm font-medium text-muted-foreground",
        isCollapsed && "lg:justify-center lg:px-0",
      )}
    >
      <span className="shrink-0 transition-colors group-hover:text-error text-muted-foreground">
        <Icons.LogOut className="w-4.5 h-4.5" />
      </span>
      {!isCollapsed && (
        <span className="transition-transform group-hover:translate-x-0.5 duration-200">
          Log out
        </span>
      )}
    </button>
  );
}
