import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WEBSITE_DETAILS } from "@/lib/constants";
import ReduxProvider from "@/redux/ReduxProvider";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
// Bricolage Grotesque
// const inter = Inter({
//   subsets: ["latin"],
//   display: "swap",
// });

// const bricolageGrotesque = Bricolage_Grotesque({
//   subsets: ["latin"],
//   display: "swap",
// });
const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: WEBSITE_DETAILS.SITE_NAME,
  description: WEBSITE_DETAILS.SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${nunito.className} antialiased`}>
        <ReduxProvider>
          <TooltipProvider>
            <svg
              width="0"
              height="0"
              className="absolute pointer-events-none -z-10"
            >
              <defs>
                <linearGradient
                  id="golden-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="1.1%" stopColor="#0089A7" />
                  <stop offset="74.38%" stopColor="#0089A7" />
                  <stop offset="99.75%" stopColor="#0089A7" />
                </linearGradient>
              </defs>
            </svg>
            <Providers>{children}</Providers>
          </TooltipProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
