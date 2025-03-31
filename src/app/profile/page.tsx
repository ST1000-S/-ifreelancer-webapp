import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Education, Certification } from "@prisma/client";
import ProfileForm from "@/components/profile/ProfileForm";
import PortfolioSection from "@/components/profile/PortfolioSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import CertificationSection from "@/components/profile/CertificationSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profile | iFreelancer",
  description: "Manage your professional profile on iFreelancer",
};

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const profile = await prisma.profile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      portfolio: true,
      experience: true,
      education: true,
      certifications: true,
    },
  });

  if (!profile) {
    // Create a new profile if it doesn't exist
    await prisma.profile.create({
      data: {
        userId: session.user.id,
      },
    });
    redirect("/profile");
  }

  const handleEducationAdd = async (
    education: Omit<Education, "id" | "createdAt" | "updatedAt">
  ) => {
    "use server";
    if (!profile?.id) return;
    await prisma.education.create({
      data: {
        ...education,
        profileId: profile.id,
      },
    });
  };

  const handleEducationDelete = async (id: string) => {
    "use server";
    await prisma.education.delete({
      where: { id },
    });
  };

  const handleCertificationAdd = async (
    certification: Omit<Certification, "id" | "createdAt" | "updatedAt">
  ) => {
    "use server";
    if (!profile?.id) return;
    await prisma.certification.create({
      data: {
        ...certification,
        profileId: profile.id,
      },
    });
  };

  const handleCertificationDelete = async (id: string) => {
    "use server";
    await prisma.certification.delete({
      where: { id },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Link href={`/portfolio/${session.user.id}`}>
          <Button variant="outline">View Public Portfolio</Button>
        </Link>
      </div>
      <div className="grid gap-8">
        <ProfileForm initialData={profile} />
        <PortfolioSection items={profile.portfolio} />
        <ExperienceSection items={profile.experience} />
        <EducationSection
          educations={profile.education}
          onAdd={handleEducationAdd}
          onDelete={handleEducationDelete}
        />
        <CertificationSection
          certifications={profile.certifications}
          onAdd={handleCertificationAdd}
          onDelete={handleCertificationDelete}
        />
      </div>
    </div>
  );
}
