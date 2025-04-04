"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import MatrixRain from "@/components/effects/MatrixRain";
import Image from "next/image";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    setValidationError("");
    setStatus("loading");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Password reset instructions have been sent to your email.");
      } else {
        setStatus("error");
        setMessage(
          data.error || "An error occurred while processing your request."
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
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
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4 py-8">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-30">
        <MatrixRain
          color="#3B82F6"
          fontSize={16}
          characters="01"
          speed={0.5}
          fadeOpacity={0.05}
          density={1.5}
        />
      </div>

      {/* Header with Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 z-10"
      >
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/images/logo.png"
            alt="iFreelancer Logo"
            width={60}
            height={60}
            className="rounded-xl"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Reset Your Password
        </h1>
        <p className="text-blue-300 text-lg">
          We&apos;ll send you instructions to reset your password
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="z-10 w-full max-w-md"
      >
        <div className="w-full max-w-md">
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-md shadow-2xl rounded-xl px-8 pt-8 pb-8 mb-4 border border-white/20"
            >
              <div className="bg-green-500/10 backdrop-blur-sm p-4 rounded-lg mb-6 border border-green-500/20 shadow-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-300">{message}</p>
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#6366F1_50%,#3B82F6_100%)]" />
                  <Link
                    href="/auth/signin"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:shadow-outline transition-colors shadow-lg inline-block relative z-10"
                  >
                    Return to Sign In
                  </Link>
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.form
              initial="hidden"
              animate="visible"
              variants={formVariants}
              className="bg-white/10 backdrop-blur-md shadow-2xl rounded-xl px-8 pt-8 pb-8 mb-4 border border-white/20"
              onSubmit={handleSubmit}
            >
              {status === "error" && (
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
                      <p className="text-sm leading-5 text-red-300">
                        {message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

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
                    className={`appearance-none bg-white/5 border ${
                      validationError ? "border-red-500" : "border-white/10"
                    } rounded-md w-full py-3 pl-10 pr-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationError) {
                        setValidationError(
                          validateEmail(e.target.value)
                            ? ""
                            : "Please enter a valid email address"
                        );
                      }
                    }}
                    required
                  />
                </div>
                {validationError && (
                  <p className="mt-1 text-sm text-red-400">{validationError}</p>
                )}
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
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
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
                        Sending Instructions...
                      </div>
                    ) : (
                      "Send Reset Instructions"
                    )}
                  </button>
                </span>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <p className="text-white/80 text-sm">
                  Remember your password?{" "}
                  <Link
                    href="/auth/signin"
                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    Back to Sign In
                  </Link>
                </p>
              </motion.div>
            </motion.form>
          )}
        </div>
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-blue-500/10 rounded-full filter blur-3xl z-0 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-3xl z-0 animate-pulse delay-700"></div>
    </div>
  );
}
