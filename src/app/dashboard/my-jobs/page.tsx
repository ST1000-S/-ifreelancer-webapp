import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";

export default async function MyJobsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "CLIENT") {
    redirect("/dashboard");
  }

  const jobs = await prisma.job.findMany({
    where: {
      creatorId: session.user.id,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Properly format dates and handle optional fields to ensure serializability
  const jobsForClient = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    description: job.description,
    budget: job.budget,
    budgetType: job.budgetType || "FIXED",
    type: job.type,
    status: job.status,
    category: job.category,
    experienceLevel: job.experienceLevel || "BEGINNER",
    availability: job.availability || "FULL_TIME",
    location: job.location || undefined,
    duration: job.duration || undefined,
    skills: job.skills || [],
    // Format dates as ISO strings to ensure they're serializable
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    creatorId: job.creatorId,
    creator: {
      id: job.creator.id,
      name: job.creator.name || "",
      email: job.creator.email,
      image: job.creator.image || undefined,
    },
    _count: {
      applications: job._count.applications,
    },
  }));

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Jobs</h1>
        <Button asChild>
          <a href="/dashboard/post-job">Post a New Job</a>
        </Button>
      </div>

      {jobsForClient.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You haven&apos;t posted any jobs yet.</p>
          <Button asChild className="mt-4">
            <a href="/dashboard/post-job">Post Your First Job</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobsForClient.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
