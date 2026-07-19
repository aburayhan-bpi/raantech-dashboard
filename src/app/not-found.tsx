"use client";

import { Button } from "@/components/ui/button";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    /* Using your dashboard-bg and soft-blue for a cleaner, branded gradient */
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-dashboard-bg to-soft-blue px-4">
      <div className="text-center max-w-md">
        {/* Icon - Using brand-5 for the background and brand for the icon */}
        {/* <div className="mb-8 flex justify-center">
          <div className="h-28 w-28 rounded-32 bg-brand-5 flex items-center justify-center animate-in fade-in zoom-in duration-500">
            <Ghost className="h-14 w-14 text-brand" />
          </div>
        </div> */}

        {/* Headings - Using your title and subtitle variables */}
        <h1 className="text-7xl font-bold text-title tracking-tight mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-title mb-3">
          Lost in Space?
        </h2>
        <p className="text-subtitle max-w-xs mx-auto mb-10 leading-relaxed">
          The page you’re looking for doesn’t exist or has been moved to a new
          coordinate.
        </p>

        {/* Actions - Applying your primary brand color and default radius */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-brand text-background rounded-lg px-8 py-6 shadow-lg shadow-brand/20 transition-all hover:scale-105"
          >
            <Link href="/dashboard/admin">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer note - Subtle branding */}
      <p className="absolute bottom-8 text-xs font-medium text-subtitle/60 tracking-wider uppercase">
        {WEBSITE_DETAILS.SITE_ONLY_NAME} &bull; {new Date().getFullYear()}
      </p>
    </div>
  );
}
