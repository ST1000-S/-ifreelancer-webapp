import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/providers/SessionProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "iFreelancer",
  description: "Find and hire top freelance talent in Sri Lanka",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const safeSession = session
    ? {
        expires: session.expires,
        user: {
          id: session.user?.id ?? "",
          email: session.user?.email ?? "",
          name: session.user?.name ?? null,
          image: session.user?.image ?? null,
          role: session.user?.role ?? "FREELANCER",
        },
      }
    : null;

  return (
    <html lang="en">
      <body>
        <SessionProvider session={safeSession}>
          <QueryProvider>
            <Navigation />
            {children}
            <Toaster />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
