"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";

import { useResetPasswordMutation } from "@/redux/api/auth/authApi";
import PassViewToggleBtn from "@/components/shared/PassViewToggleBtn";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    try {
      const result = await resetPassword({
        resetToken: token,
        newPassword: data.password,
      }).unwrap();

      if (result.success) {
        toast.success("Password reset successfully!");
        router.push("/login");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to reset password.");
    }
  };

  if (!token) {
    return (
      <div className="w-full bg-white border border-slate-200/60 shadow-sm rounded-2xl p-8 sm:p-10 text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-3">Invalid Link</h2>
        <p className="text-slate-500 text-sm mb-8">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center w-full h-12 bg-white border border-[#0089A7] text-[#0089A7] hover:bg-slate-50 font-semibold text-sm rounded-xl transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200/60 shadow-sm rounded-2xl p-8 sm:p-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Set New Password</h1>
        <p className="text-slate-500 text-sm">
          Please enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5 group">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-[18px] w-[18px]" />
            </div>
            <input
              id="password"
              type={showPassword.password ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 h-12 bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all outline-none ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
              {...register("password")}
            />
            <PassViewToggleBtn 
              field="password" 
              showPassword={showPassword.password} 
              setShowPassword={setShowPassword} 
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5 group">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-[18px] w-[18px]" />
            </div>
            <input
              id="confirmPassword"
              type={showPassword.confirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 h-12 bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all outline-none ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
              {...register("confirmPassword")}
            />
            <PassViewToggleBtn 
              field="confirmPassword" 
              showPassword={showPassword.confirmPassword} 
              setShowPassword={setShowPassword} 
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-4 bg-[#0089A7] hover:bg-[#007B96] text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Save New Password"
          )}
        </button>
      </form>
    </div>
  );
}
