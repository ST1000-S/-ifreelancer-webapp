import { Inter } from "next/font/google";
import { SessionProvider } from "@/providers/SessionProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import { MainNavigation } from "@/components/MainNavigation";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "iFreelancer",
  description: "Find the best freelancers for your projects",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <QueryProvider>
            <MainNavigation />
            <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
            <Toaster position="top-right" />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
