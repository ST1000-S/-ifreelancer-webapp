"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [activeLink, setActiveLink] = useState("/dashboard");

  useEffect(() => {
    // Set active link based on current path
    const path = window.location.pathname;
    setActiveLink(path);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const isLinkActive = (href: string) => {
    return activeLink.startsWith(href);
  };

  const linkClasses = (href: string) => {
    return `${
      isLinkActive(href)
        ? "border-primary text-gray-900 font-semibold"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary">
                  iFreelancer
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className={linkClasses("/dashboard")}
                  onClick={() => setActiveLink("/dashboard")}
                >
                  Dashboard
                </Link>
                {session?.user?.role === "CLIENT" ? (
                  <>
                    <Link
                      href="/dashboard/post-job"
                      className={linkClasses("/dashboard/post-job")}
                      onClick={() => setActiveLink("/dashboard/post-job")}
                    >
                      Post a Job
                    </Link>
                    <Link
                      href="/dashboard/my-jobs"
                      className={linkClasses("/dashboard/my-jobs")}
                      onClick={() => setActiveLink("/dashboard/my-jobs")}
                    >
                      My Jobs
                    </Link>
                    <Link
                      href="/dashboard/received-applications"
                      className={linkClasses(
                        "/dashboard/received-applications"
                      )}
                      onClick={() =>
                        setActiveLink("/dashboard/received-applications")
                      }
                    >
                      Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/jobs"
                      className={linkClasses("/jobs")}
                      onClick={() => setActiveLink("/jobs")}
                    >
                      Find Jobs
                    </Link>
                    <Link
                      href="/dashboard/my-applications"
                      className={linkClasses("/dashboard/my-applications")}
                      onClick={() =>
                        setActiveLink("/dashboard/my-applications")
                      }
                    >
                      My Applications
                    </Link>
                  </>
                )}
                <Link
                  href="/profile"
                  className={linkClasses("/profile")}
                  onClick={() => setActiveLink("/profile")}
                >
                  Profile
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/auth/signout"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
