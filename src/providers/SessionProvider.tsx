"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
  session: Session | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  // Ensure session is serializable
  const safeSession = session
    ? {
        ...session,
        user: {
          id: session.user?.id,
          name: session.user?.name || null,
          email: session.user?.email || null,
          image: session.user?.image || null,
          role: session.user?.role || null,
        },
      }
    : null;

  return (
    <NextAuthSessionProvider session={safeSession}>
      {children}
    </NextAuthSessionProvider>
  );
}
