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

  try {
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

    // Convert all data to explicitly serializable formats
    const jobsForClient = jobs.map((job) => {
      // Ensure all dates are strings
      const createdAtStr = job.createdAt.toISOString();
      const updatedAtStr = job.updatedAt.toISOString();

      // Handle all potential null/undefined values
      const budgetType = job.budgetType || "FIXED";
      const experienceLevel = job.experienceLevel || "BEGINNER";
      const availability = job.availability || "FULL_TIME";
      const location = job.location || undefined;

      // Explicitly convert duration to string regardless of its original type
      const duration = job.duration ? String(job.duration) : undefined;

      // Ensure skills is a string array
      const skills = job.skills || [];

      // Format creator data safely
      const creator = {
        id: job.creator.id,
        name: job.creator.name || "",
        email: job.creator.email,
        image: job.creator.image || undefined,
      };

      // Construct final job object with all safe properties
      return {
        id: job.id,
        title: job.title,
        description: job.description,
        budget: job.budget,
        budgetType,
        type: job.type,
        status: job.status,
        category: job.category,
        experienceLevel,
        availability,
        location,
        duration,
        skills,
        createdAt: createdAtStr,
        updatedAt: updatedAtStr,
        creatorId: job.creatorId,
        creator,
        _count: {
          applications: job._count.applications,
        },
      };
    });

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
            <p className="text-gray-500">
              You haven&apos;t posted any jobs yet.
            </p>
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
  } catch (error) {
    // Handle errors properly with fallback UI
    console.error("Error fetching jobs:", error);
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-500">
            Something went wrong
          </h1>
          <p className="mt-2 text-gray-500">
            We couldn&apos;t load your jobs. Please try again later.
          </p>
          <Button asChild className="mt-4">
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }
}
