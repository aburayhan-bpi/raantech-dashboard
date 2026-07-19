/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import FooterTextSection from "@/components/shared/FooterTextSection";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/api/auth/authApi";
import { setResetPassToken } from "@/redux/features/user/authSlice";
import { selectEmail } from "@/redux/features/verifyAuth/verifyAuth";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation();

  const emailFromStore = useAppSelector(selectEmail);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpValue = otp.join("");
  const isOtpComplete = otpValue.length === 6;
  const loading = isVerifying || isResendingOtp;

  const handleInputChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);
    setError("");

    const focusIndex = pastedData.length >= 6 ? 5 : pastedData.length;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async () => {
    if (!isOtpComplete) {
      setError("Please enter all 6 digits");
      return;
    }

    if (!emailFromStore) {
      setError("Email not found. Please try again.");
      router.replace("/login");
      return;
    }

    try {
      const result = await verifyOtp({
        email: emailFromStore,
        otp: otpValue,
      }).unwrap();

      if (result?.success && result?.data?.resetToken) {
        dispatch(setResetPassToken(result.data.resetToken));
        toast.success(result?.message ?? "OTP verified successfully");
        router.replace("/reset-password");
      }
    } catch (err) {
      setError("Invalid verification code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || !emailFromStore) return;

    setError("");
    setResendMessage("");
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    try {
      const result = await resendOtp({ email: emailFromStore }).unwrap();

      if (result?.success) {
        setResendMessage(result?.message ?? "OTP resent successfully");
        toast.success(result?.message ?? "OTP resent successfully");
        setResendCountdown(30);
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    }
  };

  useEffect(() => {
    if (!emailFromStore) {
      router.replace("/login");
    }
  }, [router, emailFromStore]);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (!resendMessage) return;

    const timer = setTimeout(() => {
      setResendMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [resendMessage]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-125 relative overflow-hidden flex flex-col justify-center bg-card rounded-32 p-8 sm:p-12"
      >
        <div className="relative z-10 flex flex-col justify-center w-full mx-auto gap-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <h1 className="text-foreground text-3xl font-bold leading-tight">
              Verification Code
            </h1>
            <div className="text-muted-foreground text-sm">
              Please enter the code sent to
              <br />
              <span className="text-foreground font-medium">
                {emailFromStore || "your email"}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* OTP Boxes */}
            <div className="flex justify-center gap-2 sm:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-transparent border border-border text-center text-xl font-semibold text-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              ))}
            </div>

            {error && <p className="text-xs text-error text-center">{error}</p>}
            {resendMessage && (
              <p className="text-xs text-green-500 text-center">
                {resendMessage}
              </p>
            )}

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isOtpComplete || loading}
              className="w-full h-12 golden-gradient-card border-0! hover:opacity-90 text-background text-[15px] font-bold rounded-xl flex items-center justify-center gap-2 transition-opacity shadow-[0_4px_14px_rgba(255,212,81,0.25)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                  Verifying
                </>
              ) : (
                "Confirm OTP"
              )}
            </button>
          </motion.div>

          {/* Resend Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            className="text-center text-sm text-text-secondary"
          >
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCountdown > 0 || isResendingOtp}
              className={`font-medium transition-colors ${
                resendCountdown > 0 || isResendingOtp
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-foreground hover:underline hover:cursor-pointer"
              }`}
            >
              {isResendingOtp
                ? "Sending..."
                : resendCountdown > 0
                  ? `Resend (${resendCountdown}s)`
                  : "Resend"}
            </button>
          </motion.div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          >
            <FooterTextSection />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
