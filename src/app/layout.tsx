import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { Navigation } from "@/components/Navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s - iFreelancer",
    default: "iFreelancer",
  },
  description: "Find the best freelancers in Sri Lanka",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Create a safe serializable session object
  const safeSession = session
    ? {
        user: {
          id: session.user?.id,
          name: session.user?.name || null,
          email: session.user?.email || null,
          image: session.user?.image || null,
          role: session.user?.role || null,
        },
        expires: session.expires,
      }
    : null;

  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className={inter.className}>
        <SessionProvider session={safeSession}>
          <QueryProvider>
            <Navigation />
            <main className="min-h-screen bg-background">{children}</main>
            <Toaster />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
