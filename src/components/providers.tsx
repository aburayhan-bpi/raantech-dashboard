"use client";

import React from "react";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "inherit",
          },
        }}
        theme="light"
      />
    </>
  );
}
