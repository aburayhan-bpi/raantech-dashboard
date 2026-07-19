"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

const SCROLL_TARGET_KEY = "scroll_target_section";

/**
 * useScrollToSection
 *
 * A reusable hook that smoothly scrolls to a section by its `id`.
 * Works from ANY route without polluting the URL:
 *   - Same page  → instantly scrolls to the element.
 *   - Other page → stores the section id in sessionStorage, navigates
 *                  to "/" and the landing page reads it on mount.
 *
 * Usage:
 *   const scrollTo = useScrollToSection();
 *   <button onClick={() => scrollTo("pricing")}>Pricing</button>
 */
export function useScrollToSection() {
  const router = useRouter();
  const pathname = usePathname();

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const isHomePage = pathname === "/";

      if (isHomePage) {
        // Already on homepage → just scroll
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        // Different page → save target silently, then navigate home
        sessionStorage.setItem(SCROLL_TARGET_KEY, sectionId);
        router.push("/");
      }
    },
    [pathname, router],
  );

  return scrollToSection;
}

/**
 * Call this once in the landing page (useEffect) to consume the pending
 * scroll target stored by useScrollToSection from another route.
 */
export function consumeScrollTarget(): string | null {
  const target = sessionStorage.getItem(SCROLL_TARGET_KEY);
  if (target) sessionStorage.removeItem(SCROLL_TARGET_KEY);
  return target;
}
