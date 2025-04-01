"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";
import { TechBackground } from "@/components/ui/TechBackground";
import { TechCard } from "@/components/ui/TechCard";
import { motion } from "framer-motion";

type SignUpData = {
  email: string;
  password: string;
  name: string;
  role: string;
};

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  const handleSubmit = async (data: SignUpData) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
      } else {
        router.push("/auth/signin");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <TechBackground>
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md flex flex-col items-center"
        >
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold text-blue-400 mb-2">
              iFreelancer
            </h1>
            <h2 className="text-3xl font-extrabold text-white">
              Create an Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Join iFreelancer and start your journey
            </p>
          </motion.div>

          <TechCard className="w-full">
            <AuthForm mode="signup" onSubmit={handleSubmit} error={error} />
          </TechCard>

          <p className="mt-6 text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </TechBackground>
  );
}
