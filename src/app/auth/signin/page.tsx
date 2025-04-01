"use client";

import { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";
import { TechBackground } from "@/components/ui/TechBackground";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <TechBackground>
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
          </Suspense>
        </motion.div>
      </div>
    </TechBackground>
  );
}
