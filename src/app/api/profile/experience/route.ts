import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { WorkExperienceFormData } from "@/types/profile";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { experience: true },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    return NextResponse.json(profile.experience);
  } catch (error) {
    console.error("[EXPERIENCE_GET]", error);
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
      company,
      location,
      type,
      description,
      startDate,
      endDate,
      current,
    } = body as WorkExperienceFormData;

    const experience = await prisma.workExperience.create({
      data: {
        profileId: profile.id,
        title,
        company,
        location,
        type,
        description,
        startDate,
        endDate,
        current,
      },
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error("[EXPERIENCE_POST]", error);
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
    const experienceId = searchParams.get("id");

    if (!experienceId) {
      return new NextResponse("Experience ID required", { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { experience: true },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Check if the experience item belongs to the user
    const experienceItem = profile.experience.find(
      (item) => item.id === experienceId
    );

    if (!experienceItem) {
      return new NextResponse("Experience item not found", { status: 404 });
    }

    await prisma.workExperience.delete({
      where: { id: experienceId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[EXPERIENCE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
