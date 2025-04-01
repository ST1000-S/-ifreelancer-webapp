import { prisma } from "@/lib/prisma";
import { JobSearchSection } from "@/components/JobSearchSection";
import { JobWithCreator } from "@/types/job";

const PAGE_SIZE = 20;

export default async function JobsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = Number(searchParams?.page) || 1;

  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: "OPEN",
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
      take: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
    });

    // Get total count for pagination
    const totalJobs = await prisma.job.count({
      where: {
        status: "OPEN",
      },
    });

    const totalPages = Math.ceil(totalJobs / PAGE_SIZE);

    // Convert jobs to a properly serialized format
    const serializedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      budgetType: job.budgetType,
      type: job.type,
      status: job.status,
      category: job.category,
      experienceLevel: job.experienceLevel,
      availability: job.availability,
      location: job.location || undefined,
      duration: job.duration ? String(job.duration) : undefined,
      skills: Array.isArray(job.skills) ? job.skills : [],
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
    })) as unknown as JobWithCreator[];

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Find Jobs</h1>
            <JobSearchSection
              initialJobs={serializedJobs}
              pagination={{
                currentPage,
                totalPages,
                totalJobs,
              }}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading jobs:", error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Find Jobs</h1>
            <div className="text-center p-8 bg-gray-800 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Error loading job listings
              </h2>
              <p className="text-gray-400">
                There was a problem loading the job listings. Please try again
                later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
