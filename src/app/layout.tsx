import { Inter } from "next/font/google";
import { SessionProvider } from "@/providers/SessionProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import { Navigation } from "@/components/Navigation";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "iFreelancer",
  description: "Find the best freelancers for your projects",
};

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100/50">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
            <Suspense fallback={<LoadingSpinner />}>
              <Navigation />
              {children}
            </Suspense>
            <Toaster position="top-right" />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
