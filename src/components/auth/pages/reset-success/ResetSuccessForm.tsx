"use client";

import { clearEmail } from "@/redux/features/verifyAuth/verifyAuth";
import { useAppDispatch } from "@/redux/hook";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetSuccessForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualRedirect = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  useEffect(() => {
    dispatch(clearEmail());
  }, [dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full relative overflow-hidden flex flex-col justify-center bg-card rounded-32 p-8 md:p-12 h-fit min-h-100"
    >
      <div className="relative z-10 flex flex-col justify-center max-w-105 w-full mx-auto h-full gap-8">
        {/* Success Icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              fill="none"
              className="w-12 h-12"
            >
              <path
                d="M50 0C22.3857 0 0 22.3857 0 50C0 77.6143 22.3857 100 50 100C77.6143 100 100 77.6143 100 50C100 22.3857 77.6143 0 50 0ZM71.4538 23.4192L81.8419 33.8073L49.3958 66.2598L39.0686 76.5808L28.6804 66.1927L18.1579 55.664L28.479 45.3429L39.0015 55.8715L71.4538 23.4192Z"
                fill="url(#paint0_linear_709_9299)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_709_9299"
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FFD451" />
                  <stop offset="1" stopColor="#FFD73C" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <h1 className="text-foreground text-3xl font-bold leading-tight">
            Password Reset
            <br />
            Successful
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs">
            Your password has been successfully updated.
          </p>
        </motion.div>

        {/* Sign In Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          onClick={handleManualRedirect}
          disabled={isSubmitting}
          className="w-full h-12 golden-gradient-card border-0! hover:opacity-90 text-background text-[15px] font-bold rounded-xl inline-flex justify-center items-center gap-2 cursor-pointer transition-opacity shadow-[0_4px_14px_rgba(255,212,81,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSubmitting ? "Redirecting..." : "Back to Login"}
        </motion.button>
      </div>
    </motion.div>
  );
}
