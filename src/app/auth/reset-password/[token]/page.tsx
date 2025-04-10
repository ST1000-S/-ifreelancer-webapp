"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Props = {
  params: {
    token: string;
  };
};

export default function ResetPasswordTokenPage({ params }: Props) {
  const { token } = params;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await fetch(
          `/api/auth/reset-password/verify?token=${token}`
        );
        const data = await response.json();

        if (response.ok && data.valid) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setMessage(
            data.message ||
              "Invalid or expired token. Please request a new password reset."
          );
        }
      } catch (error) {
        setIsTokenValid(false);
        setMessage(
          "An error occurred while verifying your token. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  const validatePassword = (password: string) => {
    // Password must be at least 8 characters and include uppercase, lowercase, number, and special character
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!minLength) return "Password must be at least 8 characters long";
    if (!hasUpperCase || !hasLowerCase)
      return "Password must include both uppercase and lowercase letters";
    if (!hasNumbers) return "Password must include at least one number";
    if (!hasSpecialChar)
      return "Password must include at least one special character";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    setValidationError("");
    setStatus("loading");

    try {
      const response = await fetch("/api/auth/reset-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Your password has been reset successfully!");
      } else {
        setStatus("error");
        setMessage(
          data.error || "An error occurred while resetting your password."
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-100 to-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">
              iFreelancer
            </h1>
            <div className="mt-8 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying token...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-100 to-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">iFreelancer</h1>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-gray-200">
          {!isTokenValid ? (
            <div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{message}</p>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6">
                <Link
                  href="/auth/reset-password"
                  className="font-medium text-primary hover:text-primary/80 underline underline-offset-2"
                >
                  Request a new password reset
                </Link>
              </div>
            </div>
          ) : status === "success" ? (
            <div>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-500"
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
                    <p className="text-sm text-green-700">{message}</p>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6">
                <Link
                  href="/auth/signin"
                  className="font-medium text-primary hover:text-primary/80 underline underline-offset-2"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {status === "error" && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationError) {
                        const error = validatePassword(e.target.value);
                        if (!error && password !== confirmPassword) {
                          setValidationError("Passwords do not match");
                        } else {
                          setValidationError(error);
                        }
                      }
                    }}
                    className={`block w-full rounded-md border ${
                      validationError ? "border-red-500" : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (validationError) {
                        if (password !== e.target.value) {
                          setValidationError("Passwords do not match");
                        } else {
                          setValidationError("");
                        }
                      }
                    }}
                    className={`block w-full rounded-md border ${
                      validationError ? "border-red-500" : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary`}
                  />
                  {validationError && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationError}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters and include uppercase,
                lowercase, number, and special character.
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {status === "loading" ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
