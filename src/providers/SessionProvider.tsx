"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { Suspense } from "react";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </NextAuthSessionProvider>
  );
}
