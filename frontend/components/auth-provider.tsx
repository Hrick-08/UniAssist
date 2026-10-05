"use client";

import { useEffect } from "react";
import { ensureAuth } from "@/lib/auth";

/** Kicks off the guest-session bootstrap as early as possible so it's
 * usually already resolved by the time a page needs an authenticated call. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureAuth().catch((err) => {
      console.error("Failed to start UniAssist session", err);
    });
  }, []);

  return <>{children}</>;
}
