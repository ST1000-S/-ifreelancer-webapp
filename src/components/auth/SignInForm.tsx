"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { logger } from "@/lib/logger";

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!result) {
        throw new Error("Authentication failed - No response from server");
      }

      if (result.error) {
        logger.error("Sign in error", new Error(result.error));

        let errorMessage = "Authentication failed";
        if (result.error === "CredentialsSignin") {
          errorMessage = "Invalid email or password";
        } else {
          errorMessage = result.error;
        }

        setError(errorMessage);
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        });
        router.push(result.url || callbackUrl);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      logger.error("Sign in error", error as Error);
      setError("An unexpected error occurred");
      toast({
        title: "Authentication Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="w-full max-w-md">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 backdrop-blur-sm p-4 rounded-lg mb-6 border border-red-500/20 shadow-lg"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm leading-5 text-red-300">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.form
        initial="hidden"
        animate="visible"
        variants={formVariants}
        className="bg-white/10 backdrop-blur-md shadow-2xl rounded-xl px-8 pt-8 pb-8 mb-4 border border-white/20"
        onSubmit={handleSubmit}
      >
        <motion.div variants={itemVariants} className="mb-6">
          <label
            className="block text-white text-sm font-semibold mb-2"
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="appearance-none bg-white/5 border border-white/10 rounded-md w-full py-3 pl-10 pr-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <label
            className="block text-white text-sm font-semibold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="appearance-none bg-white/5 border border-white/10 rounded-md w-full py-3 pl-10 pr-10 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="******************"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              )}
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-6"
        >
          <span className="relative inline-block w-full overflow-hidden rounded-full p-[1.5px] group">
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#6366F1_50%,#3B82F6_100%)]" />
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors shadow-lg relative group-hover:bg-blue-700 z-10"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <p className="text-white/80 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </div>
  );
}
