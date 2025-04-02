import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { JobType, JobCategory, JobStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Define the enums locally since they're not exported by Prisma yet
export enum JobDuration {
  LESS_THAN_1_MONTH = "LESS_THAN_1_MONTH",
  ONE_TO_THREE_MONTHS = "ONE_TO_THREE_MONTHS",
  THREE_TO_SIX_MONTHS = "THREE_TO_SIX_MONTHS",
  MORE_THAN_6_MONTHS = "MORE_THAN_6_MONTHS",
}

export enum JobAvailability {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  FLEXIBLE = "FLEXIBLE",
}

const jobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.nativeEnum(JobType),
  budget: z.number().min(0),
  category: z.nativeEnum(JobCategory),
  location: z.string().optional(),
  duration: z.number().optional(),
  skills: z.array(z.string()),
});

type WhereClause = Prisma.JobWhereInput;
type OrderByClause = Prisma.JobOrderByWithRelationInput;

// Cache duration in seconds
const CACHE_DURATION = 60;

// POST /api/jobs - Create a new job
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = jobSchema.parse(json);

    const job = await prisma.job.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        budget: body.budget,
        category: body.category,
        location: body.location,
        duration: body.duration,
        skills: body.skills,
        creatorId: session.user.id,
        status: JobStatus.OPEN,
      },
    });

    // Revalidate the jobs page
    revalidatePath("/jobs");

    return Response.json(job);
  } catch (error) {
    logger.error("Error creating job:", {
      error: error as Error,
      stack: (error as Error).stack,
      name: (error as Error).name,
      message: (error as Error).message,
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}

// GET /api/jobs - Get jobs with optional filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type") as JobType;
    const category = searchParams.get("category") as JobCategory;
    const minBudget = searchParams.get("minBudget");
    const maxBudget = searchParams.get("maxBudget");
    const skills = searchParams.get("skills")?.split(",").filter(Boolean);
    const status = (searchParams.get("status") as JobStatus) || JobStatus.OPEN;
    const creatorId = searchParams.get("creatorId");
    const location = searchParams.get("location");
    const duration = searchParams.get("duration");
    const sortBy = searchParams.get("sortBy") || "latest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Create where clause for efficient query
    const where: WhereClause = {
      status, // Always filter by status (indexed)
    };

    // Apply text search only if needed (potentially expensive)
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (type) where.type = type;
    if (category) where.category = category;

    // Apply budget range filters using our index
    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) where.budget.gte = parseFloat(minBudget);
      if (maxBudget) where.budget.lte = parseFloat(maxBudget);
    }

    // Apply skills filter (indexed)
    if (skills?.length) {
      // Use hasEvery for exact matches
      where.skills = { hasEvery: skills };
    }

    if (creatorId) where.creatorId = creatorId;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (duration) where.duration = { lte: parseInt(duration) };

    // Set up sorting based on indexed fields
    const orderBy: OrderByClause = {};
    if (sortBy === "budget_high" || sortBy === "budget_desc")
      orderBy.budget = "desc";
    else if (sortBy === "budget_low" || sortBy === "budget_asc")
      orderBy.budget = "asc";
    else if (sortBy === "latest" || sortBy === "recent")
      orderBy.createdAt = "desc";
    else if (sortBy === "oldest") orderBy.createdAt = "asc";
    else if (sortBy === "applications") {
      // Use proper sorting by application count
      // Note: This can't be done directly with OrderBy, so we'll use a workaround
      // by adding a subquery later
    }

    // Execute our paginated query for jobs with limited, specific includes
    const jobsQuery = prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        budget: true,
        budgetType: true,
        type: true,
        status: true,
        category: true,
        experienceLevel: true,
        availability: true,
        location: true,
        duration: true,
        skills: true,
        createdAt: true,
        updatedAt: true,
        creatorId: true,
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
    });

    // If sorting by application count, we need a special query
    let jobs;
    if (sortBy === "applications") {
      // Get jobs with applications count
      jobs = await prisma.job.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          budget: true,
          budgetType: true,
          type: true,
          status: true,
          category: true,
          experienceLevel: true,
          availability: true,
          location: true,
          duration: true,
          skills: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true,
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
      });

      // Sort manually by application count
      jobs.sort((a, b) => b._count.applications - a._count.applications);

      // Apply pagination manually
      jobs = jobs.slice((page - 1) * limit, page * limit);
    } else {
      // For regular sorting, use the query as is
      jobs = await jobsQuery;
    }

    // Get total count for accurate pagination
    const total = await prisma.job.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Serialize the job data to ensure it can be safely passed through the API
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
      createdAt:
        job.createdAt instanceof Date
          ? job.createdAt.toISOString()
          : job.createdAt,
      updatedAt:
        job.updatedAt instanceof Date
          ? job.updatedAt.toISOString()
          : job.updatedAt,
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

    logger.info("Jobs fetched successfully", {
      totalJobs: total,
      page,
      limit,
      filters: Object.keys(where).length - 1, // Subtract the default status filter
    });

    // Cache the response
    const response = {
      jobs: serializedJobs,
      total,
      totalPages,
      currentPage: page,
    };
    const responseText = JSON.stringify(response);
    const newResponse = new NextResponse(responseText, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, s-maxage=${CACHE_DURATION}`,
      },
    });

    await caches.default.put(
      `jobs-${JSON.stringify({ where, skip: (page - 1) * limit, limit })}`,
      newResponse.clone()
    );

    return newResponse;
  } catch (error) {
    logger.error("Error fetching jobs:", {
      error: error as Error,
      stack: (error as Error).stack,
      name: (error as Error).name,
      message: (error as Error).message,
    });
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      logger.warn("Unauthorized attempt to update job", {
        ip: req.headers.get("x-forwarded-for"),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { id, ...updateData } = data;

    // Check if job exists and user has permission
    const job = await prisma.job.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!job) {
      logger.warn("Update attempt for non-existent job", {
        jobId: id,
        userId: session.user.id,
      });
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.creatorId !== session.user.id) {
      logger.warn("Unauthorized job update attempt", {
        jobId: id,
        userId: session.user.id,
        creatorId: job.creatorId,
      });
      return NextResponse.json(
        { error: "You can only update your own job postings" },
        { status: 403 }
      );
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
    });

    logger.info("Job updated successfully", {
      jobId: id,
      userId: session.user.id,
      updates: Object.keys(updateData),
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    logger.error("Error updating job", error as Error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      logger.warn("Unauthorized attempt to delete job", {
        ip: req.headers.get("x-forwarded-for"),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      logger.warn("Delete attempt without job ID", {
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if job exists and user has permission
    const job = await prisma.job.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!job) {
      logger.warn("Delete attempt for non-existent job", {
        jobId: id,
        userId: session.user.id,
      });
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.creatorId !== session.user.id) {
      logger.warn("Unauthorized job deletion attempt", {
        jobId: id,
        userId: session.user.id,
        creatorId: job.creatorId,
      });
      return NextResponse.json(
        { error: "You can only delete your own job postings" },
        { status: 403 }
      );
    }

    await prisma.job.delete({
      where: { id },
    });

    logger.info("Job deleted successfully", {
      jobId: id,
      userId: session.user.id,
    });

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    logger.error("Error deleting job", error as Error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
