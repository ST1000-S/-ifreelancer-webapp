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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <SessionProvider>
            <QueryProvider>
              <Navigation />
              {children}
              <Toaster />
            </QueryProvider>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
