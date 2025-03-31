import { Metadata } from "next";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In - iFreelancer",
  description: "Sign in to your iFreelancer account",
};

export default function SignInPage() {
  return <SignInForm />;
}
