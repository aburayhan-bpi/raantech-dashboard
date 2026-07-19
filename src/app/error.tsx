"use client";

import { Button } from "@/components/ui/button";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service here
    console.error("App Error:", error);
  }, [error]);

  return (
    /* Using your dashboard-bg and the custom error-accent for the background */
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-dashboard-bg to-error-accent px-4">
      <div className="text-center max-w-md">
        {/* Icon - Using the error-5 background and error icon color */}
        <div className="mb-8 flex justify-center">
          <div className="h-28 w-28 rounded-24 bg-error-5 flex items-center justify-center animate-pulse">
            <AlertTriangle className="h-14 w-14 text-error" />
          </div>
        </div>

        {/* Headings - Title and Subtitle variables */}
        <h1 className="text-3xl md:text-4xl font-bold text-title mb-4 tracking-tight">
          System Interruption
        </h1>
        <p className="text-subtitle mb-10 leading-relaxed">
          An unexpected error occurred while processing your request. Our team
          has been notified.
        </p>

        {/* Actions - Using Error for primary action and standard outline for secondary */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => reset()}
            size="lg"
            className="bg-error hover:bg-error-80 text-white rounded-lg px-8 transition-transform active:scale-95"
          >
            <RefreshCcw className="mr-2 h-5 w-5" />
            Try again
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-lg border-border bg-white text-title hover:bg-muted"
          >
            <Link href="/dashboard/admin">
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer note */}
      <p className="absolute bottom-8 text-xs font-medium text-subtitle/50 tracking-widest uppercase">
        {WEBSITE_DETAILS.SITE_ONLY_NAME} &bull; {new Date().getFullYear()}
      </p>
    </div>
  );
}
