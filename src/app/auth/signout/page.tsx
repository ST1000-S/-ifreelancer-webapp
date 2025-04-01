"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut({ redirect: false });
        logger.info("User initiated sign out");
        router.push("/");
      } catch (error) {
        logger.error("Error during sign out", error as Error);
        router.push("/auth/error?error=SignOutFailed");
      }
    };

    handleSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">
            Signing Out...
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we sign you out.
          </p>
        </div>
        <div className="space-y-4">
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
