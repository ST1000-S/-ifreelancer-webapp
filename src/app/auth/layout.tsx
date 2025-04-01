import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";

export const metadata = {
  title: "Authentication - iFreelancer",
  description: "Sign in to your iFreelancer account",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      redirect("/dashboard");
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Auth layout error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-gray-600">
              There was a problem with authentication. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
