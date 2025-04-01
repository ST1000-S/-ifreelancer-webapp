"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      logger.error("Authentication error occurred", new Error(error));
    }
  }, [error]);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration. Please try again later.";
      case "AccessDenied":
        return "Access denied. You don't have permission to access this resource.";
      case "Verification":
        return "The verification link may have expired or has already been used.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        return "There was a problem with the authentication service. Please try again.";
      case "OAuthAccountNotLinked":
        return "To confirm your identity, sign in with the same account you used originally.";
      case "EmailSignin":
        return "The e-mail sign-in link is invalid or has expired.";
      case "CredentialsSignin":
        return "Sign in failed. Check the details you provided are correct.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">
            Authentication Error
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {getErrorMessage(error)}
          </p>
        </div>
        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => router.push("/auth/signin")}
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
