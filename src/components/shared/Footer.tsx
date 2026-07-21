"use client";

import { WEBSITE_DETAILS } from "@/lib/constants";
import { Mail, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background py-8 md:py-10 relative z-10 px-4 border-t border-white/5">
      <div className="customContainer mx-auto px-4 md:px-0 flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity cursor-pointer flex items-center shrink-0"
        >
          <Image draggable={false}
            src="/logo.png"
            alt="logo"
            width={45}
            height={45}
            
          />
        </Link>

        {/* Contact Info (Middle) */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-6 lg:gap-x-8 gap-y-4 text-gray-400 text-sm font-medium order-2 lg:order-0">
          <Link
            href="/contact"
            className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message Us</span>
          </Link>
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <Mail className="w-4 h-4" />
            <span>example123@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <Phone className="w-4 h-4" />
            <span>+123456789</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-gray-500 text-xs sm:text-sm font-medium tracking-wide shrink-0 order-3 lg:order-0 text-center lg:text-right">
          &copy; {currentYear} {WEBSITE_DETAILS.SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
