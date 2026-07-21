"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ResetSuccessBanner() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative hidden lg:block lg:w-1/2"
    >
      <Image draggable={false}
        src="/login/login_banner.webp"
        alt="Reset Success Banner"
        fill
        priority
        sizes="50vw"
        className="object-cover"
        
      />
    </motion.div>
  );
}
