"use client";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/authSlice";
import { TPermission } from "@/types/global";
import { ShieldAlert } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: TPermission;
}

export const PermissionGuard = ({ children, requiredPermission }: PermissionGuardProps) => {
  const currentUser = useSelector(selectUser);

  if (!currentUser) return null;
  
  if (currentUser.role === "SUPER_ADMIN") {
    return <>{children}</>;
  }

  const hasPermission = currentUser.permissions?.includes(requiredPermission);

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
        <div className="p-4 bg-rose-50 rounded-full mb-4">
          <ShieldAlert className="w-12 h-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 mt-2 text-center max-w-sm">
          You do not have the required permission 
          (<span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-medium">{requiredPermission}</span>) 
          to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
