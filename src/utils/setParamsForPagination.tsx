"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Returns a stable setter to patch URL search params.
 * Usage: const setParams = useSetSearchParams(); setParams({ page: 2, status: "ACTIVE" })
 */
export default function useSetParamsForPagination() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  return (
    patch: Record<string, string | number | boolean | null | undefined>
  ) => {
    const next = new URLSearchParams(sp.toString());

    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    });

    const qs = next.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  };
}
