import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "FREELANCER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Create an account
        </h1>
        <p className="text-gray-600">
          Join iFreelancer and start your journey today
        </p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6 border-l-4 border-red-500">
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
              <p className="text-sm leading-5 text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form
        className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-lg px-8 pt-8 pb-8 mb-4 border border-gray-200/50"
        onSubmit={handleSubmit}
      >
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-semibold mb-2"
            htmlFor="name"
          >
            Full Name
          </label>
          <input
            className="appearance-none border border-gray-300/70 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/70"
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-semibold mb-2"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            className="appearance-none border border-gray-300/70 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/70"
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

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-semibold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="appearance-none border border-gray-300/70 rounded-md w-full py-3 px-4 text-gray-700 mb-2 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/70"
            id="password"
            type="password"
            placeholder="******************"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <p className="text-xs text-gray-500">
            Password must be at least 8 characters with uppercase, lowercase,
            number and special character
          </p>
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-semibold mb-2"
            htmlFor="role"
          >
            I am a
          </label>
          <select
            className="border border-gray-300/70 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/70"
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="FREELANCER">Freelancer</option>
            <option value="CLIENT">Client</option>
          </select>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors"
            type="submit"
            disabled={loading}
          >
            {loading ? (
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
                Creating account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-primary hover:text-primary/80 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
