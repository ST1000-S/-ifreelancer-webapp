import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

interface Activity {
  id: string;
  type: string;
  title: string;
  date: string;
  status?: string;
  description?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    let activities: Activity[] = [];

    if (userRole === "CLIENT") {
      // Get recent job applications for client's jobs
      const recentApplications = await prisma.jobApplication.findMany({
        where: {
          job: {
            creatorId: userId,
          },
        },
        include: {
          job: {
            select: {
              title: true,
            },
          },
          applicant: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      // Map to activity format
      activities = recentApplications.map((app) => ({
        id: app.id,
        type: "application",
        title: `New application received`,
        description: `${app.applicant.name || "A freelancer"} applied to "${app.job.title}"`,
        date: app.createdAt.toISOString(),
        status: app.status,
      }));

      // Get recent job postings
      const recentJobs = await prisma.job.findMany({
        where: {
          creatorId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      });

      // Add job postings to activities
      activities = [
        ...activities,
        ...recentJobs.map((job) => ({
          id: `job-${job.id}`,
          type: "job",
          title: `Job posted: ${job.title}`,
          description: `Status: ${job.status}`,
          date: job.createdAt.toISOString(),
        })),
      ];
    } else {
      // For freelancers, get their recent job applications
      const recentApplications = await prisma.jobApplication.findMany({
        where: {
          applicantId: userId,
        },
        include: {
          job: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      });

      // Map to activity format
      activities = recentApplications.map((app) => ({
        id: app.id,
        type: "application",
        title: `Application ${app.status.toLowerCase()}`,
        description: `For job: "${app.job.title}"`,
        date: app.updatedAt.toISOString(),
        status: app.status,
      }));

      // Get recommended jobs based on freelancer's skills
      // This would be more complex in a real app with skill matching
      const recommendedJobs = await prisma.job.findMany({
        where: {
          status: "OPEN",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      });

      // Add recommended jobs to activities
      activities = [
        ...activities,
        ...recommendedJobs.map((job) => ({
          id: `job-${job.id}`,
          type: "job",
          title: `New job posting that may interest you`,
          description: job.title,
          date: job.createdAt.toISOString(),
        })),
      ];
    }

    // Sort all activities by date (most recent first)
    activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Take only the 10 most recent activities
    activities = activities.slice(0, 10);

    logger.info(
      `Retrieved ${activities.length} activities for user: ${userId}`
    );

    return NextResponse.json({ activities });
  } catch (error) {
    logger.error("Error fetching dashboard activity:", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 }
    );
  }
}
