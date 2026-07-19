/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { selectUser } from "@/redux/features/user/authSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Calendar,
  Key,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  const user = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmitPassword = async (data: ChangePasswordForm) => {
    try {
      // In a real app, this would call an RTK Query mutation like useChangePasswordMutation()
      // For now, we simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password updated successfully!");
      reset();
    } catch (error) {
      toast.error("Failed to update password");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your profile and security preferences
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="flex border-b border-slate-200/60">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "text-[#0089A7] border-b-2 border-[#0089A7] bg-slate-50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "security"
                ? "text-[#0089A7] border-b-2 border-[#0089A7] bg-slate-50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
            }`}
          >
            Security
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-[#0089A7]/10 flex items-center justify-center text-[#0089A7] text-4xl font-bold uppercase shadow-inner border-2 border-[#0089A7]/20">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" /> Full Name
                  </label>
                  <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {user.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" /> Email Address
                  </label>
                  <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {user.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" /> Account Created
                  </label>
                  <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {/* Assuming createdAt is added to the auth token eventually, or use a static fallback */}
                    {format(new Date(), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#0089A7]" /> Change Password
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Ensure your account is using a long, random password to stay
                  secure.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmitPassword)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    {...register("currentPassword")}
                    className={`w-full h-11 px-4 bg-slate-50 border ${errors.currentPassword ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"} text-sm rounded-xl outline-none transition-all`}
                  />
                  {errors.currentPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...register("newPassword")}
                    className={`w-full h-11 px-4 bg-slate-50 border ${errors.newPassword ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"} text-sm rounded-xl outline-none transition-all`}
                  />
                  {errors.newPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    className={`w-full h-11 px-4 bg-slate-50 border ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"} text-sm rounded-xl outline-none transition-all`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 px-6 bg-[#0089A7] hover:bg-[#007B96] text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-[#0089A7]/20 flex items-center justify-center gap-2 disabled:opacity-70 w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
