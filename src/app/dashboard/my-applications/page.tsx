import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplicationList } from "@/components/ApplicationList";

export default async function MyApplicationsPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const applications = await prisma.jobApplication.findMany({
    where: {
      applicantId: session.user.id,
    },
    include: {
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      <ApplicationList applications={applications} />
    </div>
  );
}
