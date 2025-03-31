import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PortfolioFormData } from "@/types/profile";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { portfolio: true },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    return NextResponse.json(profile.portfolio);
  } catch (error) {
    console.error("[PORTFOLIO_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      imageUrl,
      projectUrl,
      skills,
      startDate,
      endDate,
    } = body as PortfolioFormData;

    const portfolio = await prisma.portfolio.create({
      data: {
        profileId: profile.id,
        title,
        description,
        imageUrl,
        projectUrl,
        skills,
        startDate,
        endDate,
      },
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("[PORTFOLIO_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const portfolioId = searchParams.get("id");

    if (!portfolioId) {
      return new NextResponse("Portfolio ID required", { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { portfolio: true },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Check if the portfolio item belongs to the user
    const portfolioItem = profile.portfolio.find(
      (item) => item.id === portfolioId
    );

    if (!portfolioItem) {
      return new NextResponse("Portfolio item not found", { status: 404 });
    }

    await prisma.portfolio.delete({
      where: { id: portfolioId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PORTFOLIO_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
