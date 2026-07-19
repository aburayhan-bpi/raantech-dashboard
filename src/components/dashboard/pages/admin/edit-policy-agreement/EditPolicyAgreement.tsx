"use client";

import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import { useState } from "react";

const PrivacyContent = `Last Updated: June 2026

Welcome to Will Knowledge. We respect your privacy and 
are committed to protecting your personal information.

1. Information We Collect

We may collect:

Name and email address
Account information
Subscription details`;

const TermsContent = `Last Updated: June 2026

Welcome to Will Knowledge. By using our platform, you 
agree to these Terms & Conditions.

1. Platform Usage

Will Knowledge provides AI-assisted market analysis, 
trading insights, alerts, and educational tools.

Users must use the platform responsibly and follow 
applicable laws.`;

export default function EditPolicyAgreement() {
  const [privacyText, setPrivacyText] = useState(PrivacyContent);
  const [termsText, setTermsText] = useState(TermsContent);

  return (
    <div className="w-full h-full flex flex-col gap-6 min-w-0 pb-10 px-0">
      {/* Privacy Policy Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-[#1e1e1e] border border-white/5 rounded-2xl p-6 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icons.RiShieldStarFill className="w-5 h-5 text-white fill-white" />
            <h2 className="text-xl font-normal text-foreground">
              Privacy Policy
            </h2>
          </div>
          <span className="text-sm text-gray-500">Last Update: 20/06/2026</span>
        </div>

        <div className="flex-1 min-h-62.5 mb-4">
          <textarea
            value={privacyText}
            onChange={(e) => setPrivacyText(e.target.value)}
            className="w-full h-full min-h-62.5 bg-transparent border border-white/10 rounded-xl p-4 text-gray-300 text-sm focus:outline-none focus:border-white/30 resize-none transition-colors"
          />
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2.5 bg-soft-blue hover:bg-soft-blue/90 border border-white/10 text-white text-sm font-medium rounded-xl transition-all cursor-pointer shadow-sm hover:shadow">
            Update & Confirm
          </button>
        </div>
      </motion.div>

      {/* Terms & Conditions Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full bg-[#1e1e1e] border border-white/5 rounded-2xl p-6 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icons.RiShieldStarFill className="w-5 h-5 text-white fill-white" />
            <h2 className="text-xl font-normal text-foreground">
              Terms & Conditions
            </h2>
          </div>
          <span className="text-sm text-gray-500">Last Update: 20/06/2026</span>
        </div>

        <div className="flex-1 min-h-62.5 mb-4">
          <textarea
            value={termsText}
            onChange={(e) => setTermsText(e.target.value)}
            className="w-full h-full min-h-62.5 bg-transparent border border-white/10 rounded-xl p-4 text-gray-300 text-sm focus:outline-none focus:border-white/30 resize-none transition-colors"
          />
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2.5 bg-soft-blue hover:bg-soft-blue/90 border border-white/10 text-white text-sm font-medium rounded-xl transition-all cursor-pointer shadow-sm hover:shadow">
            Update & Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
