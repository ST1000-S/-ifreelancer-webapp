import { useState } from "react";

type SignInData = {
  email: string;
  password: string;
};

type SignUpData = {
  email: string;
  password: string;
  name: string;
  role: string;
};

interface BaseAuthFormProps {
  error?: string;
}

interface SignInAuthFormProps extends BaseAuthFormProps {
  mode: "signin";
  onSubmit: (data: SignInData) => void | Promise<void>;
}

interface SignUpAuthFormProps extends BaseAuthFormProps {
  mode: "signup";
  onSubmit: (data: SignUpData) => void | Promise<void>;
}

type AuthFormProps = SignInAuthFormProps | SignUpAuthFormProps;

export function AuthForm({ mode, onSubmit, error }: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "FREELANCER",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // Password must be at least 8 characters and include uppercase, lowercase, number, and special character
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (mode === "signup") {
      if (!minLength) return "Password must be at least 8 characters long";
      if (!hasUpperCase || !hasLowerCase)
        return "Password must include both uppercase and lowercase letters";
      if (!hasNumbers) return "Password must include at least one number";
      if (!hasSpecialChar)
        return "Password must include at least one special character";
    }

    return "";
  };

  const validateName = (name: string) => {
    if (mode === "signup" && name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate fields
    const errors = {
      email: !validateEmail(formData.email)
        ? "Please enter a valid email address"
        : undefined,
      password: validatePassword(formData.password) || undefined,
      name:
        mode === "signup"
          ? validateName(formData.name) || undefined
          : undefined,
    };

    setValidationErrors(errors);

    // If there are errors, don't submit
    if (Object.values(errors).some((error) => error !== undefined)) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "signin") {
        const { email, password } = formData;
        await onSubmit({ email, password });
      } else {
        await onSubmit(formData as SignUpData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-2xl border border-gray-200/50"
    >
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
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
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {mode === "signup" && (
        <>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (validationErrors.name) {
                  setValidationErrors({
                    ...validationErrors,
                    name: validateName(e.target.value) || undefined,
                  });
                }
              }}
              className={`mt-1 block w-full rounded-md border ${
                validationErrors.name ? "border-red-500" : "border-gray-300/70"
              } px-3 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary bg-white/70`}
              required
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              I am a
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300/70 px-3 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary bg-white/70"
            >
              <option value="FREELANCER">Freelancer</option>
              <option value="CLIENT">Client</option>
            </select>
          </div>
        </>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (validationErrors.email) {
              setValidationErrors({
                ...validationErrors,
                email: !validateEmail(e.target.value)
                  ? "Please enter a valid email address"
                  : undefined,
              });
            }
          }}
          className={`mt-1 block w-full rounded-md border ${
            validationErrors.email ? "border-red-500" : "border-gray-300/70"
          } px-3 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary bg-white/70`}
          required
        />
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            if (validationErrors.password) {
              setValidationErrors({
                ...validationErrors,
                password: validatePassword(e.target.value) || undefined,
              });
            }
          }}
          className={`mt-1 block w-full rounded-md border ${
            validationErrors.password ? "border-red-500" : "border-gray-300/70"
          } px-3 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary bg-white/70`}
          required
        />
        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>
              {mode === "signin" ? "Signing In..." : "Creating Account..."}
            </span>
          </div>
        ) : mode === "signin" ? (
          "Sign In"
        ) : (
          "Create Account"
        )}
      </button>

      {mode === "signup" && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters and include uppercase,
            lowercase, number, and special character
          </p>
        </div>
      )}
    </form>
  );
}
