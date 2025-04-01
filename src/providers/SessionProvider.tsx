"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { ReactNode } from "react";
import { UserRole } from "@prisma/client";

interface SessionProviderProps {
  children: ReactNode;
  session: Session | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  // Ensure session is serializable
  const safeSession = session
    ? {
        expires: session.expires,
        user: {
          id: session.user?.id || "",
          email: session.user?.email || "",
          name: session.user?.name || null,
          image: session.user?.image || null,
          role: (session.user?.role as UserRole) || "FREELANCER",
        },
      }
    : null;

  return (
    <NextAuthSessionProvider session={safeSession}>
      {children}
    </NextAuthSessionProvider>
  );
}
