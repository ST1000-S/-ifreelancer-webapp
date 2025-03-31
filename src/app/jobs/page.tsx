import { prisma } from "@/lib/prisma";
import { JobSearchSection } from "@/components/JobSearchSection";
import { JobWithCreator } from "@/types/job";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Find Jobs</h1>
          <JobSearchSection initialJobs={jobs as JobWithCreator[]} />
        </div>
      </div>
    </div>
  );
}
