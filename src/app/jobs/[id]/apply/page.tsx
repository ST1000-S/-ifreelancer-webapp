"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function ApplyToJobPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }

      router.push("/dashboard/my-applications");
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to submit application");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container py-10">
      <ApplicationForm
        jobId={params.id}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
