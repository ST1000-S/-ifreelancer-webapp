"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { JobForm, JobFormData } from "@/components/JobForm";

export default function PostJob() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  const handleSubmit = async (data: JobFormData) => {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
      } else {
        router.push("/dashboard/my-jobs");
      }
    } catch (error) {
      setError("Failed to post job. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>
      <JobForm onSubmit={handleSubmit} error={error} />
    </div>
  );
}
