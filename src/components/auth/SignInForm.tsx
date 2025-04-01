"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logger } from "@/lib/logger";

interface FormData {
  email: string;
  password: string;
}

export default function SignInForm(): JSX.Element {
  const router = useRouter();
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
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!result) {
        throw new Error("Authentication failed");
      }

      if (result.error) {
        logger.error("Sign in error", new Error(result.error));
        toast({
          title: "Error",
          description:
            result.error === "CredentialsSignin"
              ? "Invalid email or password"
              : "An error occurred during sign in",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Signed in successfully",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      logger.error("Sign in error", error as Error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" aria-label="Go to homepage">
            iFreelancer
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;iFreelancer has transformed how I find work. The
              platform&apos;s focus on local talent and secure payments makes it
              my go-to choice for freelancing.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={handleSubmit} data-testid="signin-form">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    aria-label="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    data-testid="email-input"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="sr-only">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    aria-label="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    data-testid="password-input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="submit-button"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/auth/signup"
              className="hover:text-brand underline underline-offset-4"
              data-testid="signup-link"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
