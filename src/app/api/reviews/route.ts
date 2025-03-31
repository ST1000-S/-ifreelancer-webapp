import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
  jobId: z.string(),
  revieweeId: z.string(),
});

// POST /api/reviews - Create a new review
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn("Unauthorized review creation attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = reviewSchema.parse(data);

    // Check if the user has already reviewed this job
    const existingReview = await prisma.review.findFirst({
      where: {
        jobId: validatedData.jobId,
        reviewerId: session.user.id,
        revieweeId: validatedData.revieweeId,
      },
    });

    if (existingReview) {
      logger.warn("Duplicate review attempt", { jobId: validatedData.jobId });
      return NextResponse.json(
        { error: "You have already reviewed this job" },
        { status: 400 }
      );
    }

    // Check if the job exists and is completed
    const job = await prisma.job.findUnique({
      where: { id: validatedData.jobId },
      include: {
        applications: {
          where: { status: "ACCEPTED" },
          select: { applicantId: true },
        },
        creator: true,
      },
    });

    if (!job) {
      logger.warn("Review creation attempt for non-existent job", {
        jobId: validatedData.jobId,
      });
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "COMPLETED") {
      logger.warn("Review creation attempt for incomplete job", {
        jobId: validatedData.jobId,
      });
      return NextResponse.json(
        { error: "Can only review completed jobs" },
        { status: 400 }
      );
    }

    // Verify that the user is either the creator or the accepted applicant
    const acceptedApplicant = job.applications.find(
      (app) => app.applicantId === validatedData.revieweeId
    );
    if (session.user.id !== job.creatorId && !acceptedApplicant) {
      logger.warn("Review creation attempt by unauthorized user", {
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: "You are not authorized to review this job" },
        { status: 403 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        job: { connect: { id: validatedData.jobId } },
        reviewer: { connect: { id: session.user.id } },
        reviewee: { connect: { id: validatedData.revieweeId } },
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    logger.info("Review created successfully");
    return NextResponse.json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid review data");
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    const errorObj =
      error instanceof Error ? error : new Error("Unknown error");
    logger.error("Error creating review", errorObj);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// GET /api/reviews - Get reviews for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const jobId = searchParams.get("jobId");
    const type = searchParams.get("type"); // 'given' or 'received'

    if (!userId && !jobId) {
      logger.warn("Review fetch attempt without userId or jobId");
      return NextResponse.json(
        { error: "Either userId or jobId is required" },
        { status: 400 }
      );
    }

    const whereClause = {
      ...(jobId ? { jobId } : {}),
      ...(userId
        ? { [type === "given" ? "reviewerId" : "revieweeId"]: userId }
        : {}),
    };

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error("Unknown error");
    logger.error("Error fetching reviews", errorObj);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
