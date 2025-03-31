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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") {
      const { email, password } = formData;
      await onSubmit({ email, password });
    } else {
      await onSubmit(formData as SignUpData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {mode === "signup" && (
        <>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
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
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white rounded-md py-2 hover:bg-opacity-90 transition"
      >
        {mode === "signin" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
}
