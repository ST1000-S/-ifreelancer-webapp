import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplicationList } from "@/components/ApplicationList";

export default async function MyApplicationsPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  try {
    const applications = await prisma.jobApplication.findMany({
      where: {
        applicantId: session.user.id,
      },
      include: {
        job: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Serialize the application data to ensure it can be safely passed to client components
    const serializedApplications = applications.map((application) => ({
      id: application.id,
      jobId: application.jobId,
      applicantId: application.applicantId,
      coverLetter: application.coverLetter,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      job: {
        id: application.job.id,
        title: application.job.title,
        description: application.job.description,
        budget: application.job.budget,
        budgetType: application.job.budgetType,
        type: application.job.type,
        status: application.job.status,
        category: application.job.category,
        experienceLevel: application.job.experienceLevel,
        availability: application.job.availability,
        location: application.job.location || undefined,
        duration: application.job.duration
          ? String(application.job.duration)
          : undefined,
        skills: Array.isArray(application.job.skills)
          ? application.job.skills
          : [],
        createdAt: application.job.createdAt.toISOString(),
        updatedAt: application.job.updatedAt.toISOString(),
        creatorId: application.job.creatorId,
      },
    }));

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">My Applications</h1>
        <ApplicationList applications={serializedApplications} />
      </div>
    );
  } catch (error) {
    console.error("Error loading applications:", error);
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">My Applications</h1>
        <div className="text-center py-8 bg-gray-800 rounded-lg">
          <p className="text-muted-foreground">
            There was a problem loading your applications. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }
}
