import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock, Briefcase } from "lucide-react";

export function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "FREELANCER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const checkPasswordStrength = (password: string) => {
    let strength = 0;

    // Check for length
    if (password.length >= 8) strength += 1;

    // Check for lowercase
    if (/[a-z]/.test(password)) strength += 1;

    // Check for uppercase
    if (/[A-Z]/.test(password)) strength += 1;

    // Check for numbers
    if (/[0-9]/.test(password)) strength += 1;

    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Show success message for signup
      toast({
        title: "Account created successfully",
        description: "Signing you in...",
      });

      // Login the user after successful registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(
          signInResult.error || "Failed to sign in automatically"
        );
      }

      // Wait a moment for the session to be established
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Welcome!",
        description: "Redirecting to your dashboard...",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create account"
      );
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            htmlFor="name"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="appearance-none bg-white/5 border border-white/10 rounded-md w-full py-3 pl-10 pr-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
        </motion.div>

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

        <motion.div variants={itemVariants} className="mb-6">
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
              className="appearance-none bg-white/5 border border-white/10 rounded-md w-full py-3 pl-10 pr-10 text-white mb-2 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="******************"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                checkPasswordStrength(e.target.value);
              }}
              required
              minLength={8}
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

          {/* Password strength meter */}
          {formData.password && (
            <div className="mt-2 mb-4">
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Password strength:{" "}
                {passwordStrength <= 2
                  ? "Weak"
                  : passwordStrength <= 3
                    ? "Medium"
                    : "Strong"}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-300">
            Password must be at least 8 characters with uppercase, lowercase,
            number and special character
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <label
            className="block text-white text-sm font-semibold mb-2"
            htmlFor="role"
          >
            I am a
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="bg-white/5 border border-white/10 rounded-md w-full py-3 pl-10 pr-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="FREELANCER">Freelancer</option>
              <option value="CLIENT">Client</option>
            </select>
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
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <p className="text-white/80 text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </div>
  );
}
