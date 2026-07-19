"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useForgotPasswordMutation } from "@/redux/api/auth/authApi";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      const result = await forgotPassword(data).unwrap();
      if (result.success) {
        setIsSuccess(true);
        toast.success("Password reset link sent to your email");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to send reset link");
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full bg-white border border-slate-200/60 shadow-sm rounded-2xl p-8 sm:p-10 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-3">Check your email</h2>
        <p className="text-slate-500 text-sm mb-8">
          We&apos;ve sent a password reset link to your email address. Please check your inbox and spam folder.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full h-12 bg-white border border-[#0089A7] text-[#0089A7] hover:bg-slate-50 font-semibold text-sm rounded-xl transition-colors"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200/60 shadow-sm rounded-2xl p-8 sm:p-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Forgot Password</h1>
        <p className="text-slate-500 text-sm">
          No worries, we&apos;ll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5 group">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-[18px] w-[18px]" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`w-full pl-10 pr-4 h-12 bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all outline-none ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
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
              Sending link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-[#0089A7] hover:text-[#006A82]">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
