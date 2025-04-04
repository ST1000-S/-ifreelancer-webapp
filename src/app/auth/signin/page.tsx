"use client";

import { SignInForm } from "@/components/auth/SignInForm";
import MatrixRain from "@/components/effects/MatrixRain";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SignInPage() {
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
          Welcome Back
        </h1>
        <p className="text-blue-300 text-lg">
          Sign in to continue to iFreelancer
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="z-10 w-full max-w-md"
      >
        <SignInForm />
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full filter blur-3xl z-0 animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-3xl z-0 animate-pulse delay-700"></div>
    </div>
  );
}
