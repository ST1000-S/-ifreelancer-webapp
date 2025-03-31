import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    if (userRole === "CLIENT") {
      // Get stats for client
      const [totalJobs, activeJobs, completedJobs, applications] =
        await Promise.all([
          prisma.job.count({
            where: { creatorId: userId },
          }),
          prisma.job.count({
            where: {
              creatorId: userId,
              status: "OPEN",
            },
          }),
          prisma.job.count({
            where: {
              creatorId: userId,
              status: "COMPLETED",
            },
          }),
          prisma.jobApplication.count({
            where: {
              job: {
                creatorId: userId,
              },
            },
          }),
        ]);

      return NextResponse.json({
        totalJobs,
        activeJobs,
        completedJobs,
        applications,
      });
    } else {
      // Get stats for freelancer
      const [totalJobs, applications, activeJobs, completedJobs] =
        await Promise.all([
          prisma.job.count({
            where: { status: "OPEN" },
          }),
          prisma.jobApplication.count({
            where: { applicantId: userId },
          }),
          prisma.job.count({
            where: {
              status: "IN_PROGRESS",
              applications: {
                some: {
                  applicantId: userId,
                  status: "ACCEPTED",
                },
              },
            },
          }),
          prisma.job.count({
            where: {
              status: "COMPLETED",
              applications: {
                some: {
                  applicantId: userId,
                  status: "ACCEPTED",
                },
              },
            },
          }),
        ]);

      return NextResponse.json({
        totalJobs,
        applications,
        activeJobs,
        completedJobs,
      });
    }
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
