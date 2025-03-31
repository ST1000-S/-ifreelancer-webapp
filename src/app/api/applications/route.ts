import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

const applicationSchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().min(50).max(1000),
  proposedRate: z.number().min(1),
  availability: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
});

// POST /api/applications - Create a new job application
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn("Unauthorized application attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = applicationSchema.parse(data);

    // Check if application already exists
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: validatedData.jobId,
        applicantId: session.user.id,
      },
    });

    if (existingApplication) {
      logger.warn("Duplicate application attempt", {
        jobId: validatedData.jobId,
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: validatedData.jobId,
        applicantId: session.user.id,
        coverLetter: validatedData.coverLetter,
        proposedRate: validatedData.proposedRate,
        availability: validatedData.availability,
        startDate: validatedData.startDate,
        status: "PENDING",
        attachments: [],
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            creatorId: true,
          },
        },
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info("Application created", { applicationId: application.id });

    return NextResponse.json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logger.error(
      "Error creating application",
      new Error(error instanceof Error ? error.message : "Unknown error")
    );
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

// GET /api/applications - Get applications for a job
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      logger.warn("Application fetch attempt without job ID");
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    logger.error(
      "Error fetching applications",
      new Error(error instanceof Error ? error.message : "Unknown error")
    );
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
