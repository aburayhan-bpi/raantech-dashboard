"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "preselectedRole";
// COOKIE_KEY is now managed server-side by /api/role

export default function useRegisterRole() {
  const [role, setRole] = useState<string | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const setRoleSafe = useCallback((r: string | null) => {
    try {
      if (typeof window !== "undefined") {
        if (r) sessionStorage.setItem(STORAGE_KEY, r);
        else sessionStorage.removeItem(STORAGE_KEY);
        // call server API to set an HttpOnly cookie (safer than client-set cookie)
        try {
          if (r) {
            fetch("/api/role", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-requested-with": "fetch",
              },
              body: JSON.stringify({ role: r }),
              credentials: "same-origin",
            }).catch(() => {});
          } else {
            fetch("/api/role", {
              method: "DELETE",
              credentials: "same-origin",
            }).catch(() => {});
          }
        } catch {}
      }
      setRole(r);
    } catch {
      // ignore
    }
  }, []);

  const clearRole = useCallback(() => setRoleSafe(null), [setRoleSafe]);

  return { role, setRole: setRoleSafe, clearRole };
}
