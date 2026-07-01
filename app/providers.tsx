"use client";

import { ProgressProvider } from "@bprogress/next/app";

export function ProgressBarProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider height="3px" options={{ showSpinner: false }}>
      {children}
    </ProgressProvider>
  );
}
