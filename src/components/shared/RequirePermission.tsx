"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/authSlice";
import { Loader2, ShieldAlert } from "lucide-react";

interface RequirePermissionProps {
  children: React.ReactNode;
  module: string;
  action?: "view" | "create" | "update" | "delete";
}

export function RequirePermission({
  children,
  module,
  action = "view",
}: RequirePermissionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector(selectUser);

  // Cross-Role Protection calculation
  const currentRolePath = user?.role ? user.role.toLowerCase().replace("_", "-") : "";
  const allowedPrefix = `/dashboard/${currentRolePath}`;
  const isCrossRole =
    user && pathname.startsWith("/dashboard/") && !pathname.startsWith(allowedPrefix);

  // Effect for redirects only
  useEffect(() => {
    if (user === undefined) return;
    
    if (!user) {
      router.replace("/login");
      return;
    }

    if (isCrossRole) {
      router.replace(allowedPrefix);
    }
  }, [user, isCrossRole, allowedPrefix, router]);

  // Loading state while Redux prepares user data
  if (!user || isCrossRole) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0089A7]" />
      </div>
    );
  }

  // Evaluate permission
  const requiredPermission = `${module}:${action}`;
  const hasAccess =
    user.role === "SUPER_ADMIN" ||
    (user.permissions && user.permissions.includes(requiredPermission)) ||
    false;

  // Render Access Denied UI if they are on their own route but lack specific permissions
  if (!hasAccess) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[65vh] p-6 text-center">
        <div className="bg-red-50 text-red-500 rounded-full p-6 mb-6">
          <ShieldAlert className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied!</h2>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed">
          Your account does not have permission to access the <strong>{module}</strong> feature. 
          Please contact the Super Admin if you believe this is a mistake.
        </p>
      </div>
    );
  }

  // Allowed!
  return <>{children}</>;
}
