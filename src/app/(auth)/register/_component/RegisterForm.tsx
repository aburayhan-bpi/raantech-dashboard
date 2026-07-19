"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useSignUpMutation } from "@/redux/api/auth/authApi";
import { IRegisterPayload } from "@/types/global";
import PassViewToggleBtn from "@/components/shared/PassViewToggleBtn";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useSignUpMutation();
  const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload: IRegisterPayload = {
        fullName: data.name,
        email: data.email,
        password: data.password,
        role: "USER",
      };

      const result = await registerUser(payload).unwrap();
      if (result.success) {
        toast.success("Account created successfully!");
        router.push("/login");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/60 shadow-sm rounded-2xl p-8 sm:p-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Create Account</h1>
        <p className="text-slate-500 text-sm">Join Raantech and get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5 group">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="h-[18px] w-[18px]" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              className={`w-full pl-10 pr-4 h-12 bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all outline-none ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

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

        <div className="space-y-1.5 group">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
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
              Creating account...
            </>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#0089A7] hover:text-[#006A82]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
