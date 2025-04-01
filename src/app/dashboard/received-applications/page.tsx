import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReceivedApplicationList from "@/components/ReceivedApplicationList";

export default async function ReceivedApplicationsPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  try {
    const applications = await prisma.jobApplication.findMany({
      where: {
        job: {
          creatorId: session.user.id,
        },
      },
      include: {
        job: true,
        applicant: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get the schema of fields actually available in jobApplication
    const serializedApplications = applications.map((application) => {
      const serializedApp = {
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
        applicant: {
          id: application.applicant.id,
          name: application.applicant.name,
          email: application.applicant.email,
          image: application.applicant.image,
          profile: null,
        },
      };

      // Add proposedRate only if it exists
      if ("proposedRate" in application) {
        // @ts-ignore - we're checking if the property exists dynamically
        serializedApp.proposedRate = application.proposedRate;
      }

      // Safely handle profile data
      if (application.applicant.profile) {
        serializedApp.applicant.profile = {
          id: application.applicant.profile.id,
          userId: application.applicant.profile.userId,
          title: application.applicant.profile.title,
          bio: application.applicant.profile.bio,
          hourlyRate: application.applicant.profile.hourlyRate,
          skills: application.applicant.profile.skills,
          availability: application.applicant.profile.availability,
          location: application.applicant.profile.location,
          createdAt: application.applicant.profile.createdAt.toISOString(),
          updatedAt: application.applicant.profile.updatedAt.toISOString(),
        };
      }

      return serializedApp;
    });

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Received Applications</h1>
        <ReceivedApplicationList initialApplications={serializedApplications} />
      </div>
    );
  } catch (error) {
    console.error("Error loading received applications:", error);
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Received Applications</h1>
        <div className="text-center py-8 bg-gray-800 rounded-lg">
          <p className="text-muted-foreground">
            There was a problem loading the applications. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }
}
