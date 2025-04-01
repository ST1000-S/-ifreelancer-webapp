"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logger } from "@/lib/logger";
import { TechCard } from "@/components/ui/TechCard";
import { motion } from "framer-motion";

interface FormData {
  email: string;
  password: string;
}

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const callbackUrl = searchParams.get("from") || "/dashboard";
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        throw new Error("Authentication failed - No response from server");
      }

      if (result.error) {
        logger.error("Sign in error", new Error(result.error));
        toast({
          title: "Error",
          description:
            result.error === "CredentialsSignin"
              ? "Invalid email or password"
              : result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.url) {
        toast({
          title: "Success",
          description: "Signed in successfully",
        });

        router.push(result.url);
        router.refresh();
      }
    } catch (error) {
      logger.error("Sign in error", error as Error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-4xl font-bold text-blue-400 mb-2">iFreelancer</h1>
        <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Or{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            create a new account
          </Link>
        </p>
      </motion.div>

      <TechCard className="py-8 px-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email address
            </Label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="block w-full rounded-md border border-gray-300/70 px-3 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary bg-white/70"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="text-sm">
                <Link
                  href="/auth/reset-password"
                  className="font-medium text-primary hover:text-primary/80 underline underline-offset-2"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            <div className="mt-1">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="block w-full rounded-md border border-gray-300/70 px-3 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary bg-white/70"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/80 text-gray-500">
                New to iFreelancer?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/auth/signup">
              <Button
                variant="outline"
                className="w-full flex justify-center py-2 px-4 border border-gray-300/50 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white/70 hover:bg-gray-50"
              >
                Create an account
              </Button>
            </Link>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
