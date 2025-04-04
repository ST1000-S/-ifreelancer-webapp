import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-middleware";
import type { Prisma } from "@prisma/client";

async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const skills = searchParams.get("skills")?.split(",").filter(Boolean) || [];
  const minBudget = Number(searchParams.get("minBudget")) || 0;
  const maxBudget =
    Number(searchParams.get("maxBudget")) || Number.MAX_SAFE_INTEGER;
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const where: Prisma.JobWhereInput = {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ],
    AND: [
      { budget: { gte: minBudget } },
      { budget: { lte: maxBudget } },
      ...(skills.length > 0
        ? [{ skills: { some: { name: { in: skills } } } }]
        : []),
    ],
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    jobs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export const GET = withErrorHandler(handler);
