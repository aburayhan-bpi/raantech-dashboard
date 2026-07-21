"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function LoginBanner() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative hidden lg:flex flex-col justify-between w-1/2 rounded-32 p-10 xl:p-12 overflow-hidden min-h-220"
    >
      {/* Background Glow / Image Placeholder */}
      <div className="absolute inset-0 z-0">
        <Image draggable={false}
          src="/login/login_side_bg.jpg"
          alt="Login Banner Background"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-50 mix-blend-lighten"
          
        />
      </div>

      {/* Top Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="relative z-10"
      >
        <Image draggable={false}
          src="/logo.png"
          alt="logo"
          width={50}
          height={50}
          
        />
      </motion.div>

      {/* Bottom Content */}
      <div className="relative z-10 flex flex-col gap-10 mt-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="space-y-4"
        >
          <h2 className="text-white text-4xl xl:text-[44px] font-bold leading-[1.1] tracking-tight">
            Institutional-level analysis.
            <br />
            Automated
          </h2>
          <p className="text-[#A19D93] text-[17px] leading-relaxed max-w-lg">
            AI-powered signals and analysis to give every trader a true
            institutional edge.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-2 lg:gap-3 xl:gap-4">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            className="golden-gradient-card p-3 lg:p-4 xl:p-5 flex flex-col justify-between h-35"
          >
            <p className="text-background font-bold text-[13px] lg:text-[14px] xl:text-[15px] leading-snug wrap-break-word">
              Real-time AI buy/
              <wbr />
              sell signals
            </p>
            <p className="text-[#121212] font-semibold text-[10px] xl:text-xs mt-4 tracking-wide font-mono">
              • Real time auto level
            </p>
          </motion.div>
          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            className="glass-card p-3 lg:p-4 xl:p-5 flex flex-col justify-between min-h-35"
          >
            <p className="text-white font-semibold text-[13px] lg:text-[14px] xl:text-[15px] leading-snug wrap-break-word">
              Support/
              <wbr />
              resistance detection
            </p>
            <p className="text-white/60 text-[10px] xl:text-xs mt-4 tracking-wide font-mono">
              • Multi-timeframe
            </p>
          </motion.div>
          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
            className="glass-card p-3 lg:p-4 xl:p-5 flex flex-col justify-between min-h-35"
          >
            <p className="text-white font-semibold text-[13px] lg:text-[14px] xl:text-[15px] leading-snug wrap-break-word">
              US stocks covered
            </p>
            <p className="text-white/60 text-[10px] xl:text-xs mt-4 tracking-wide font-mono">
              • 4,200+
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
