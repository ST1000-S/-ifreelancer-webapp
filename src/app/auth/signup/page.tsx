"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Create an Account</h1>
        <p className="text-gray-600">Join iFreelancer to start your journey</p>
      </div>

      <AuthForm mode="signup" onSubmit={handleSubmit} error={error} />

      <p className="mt-4 text-gray-600">
        Already have an account?{" "}
        <a href="/auth/signin" className="text-primary hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
