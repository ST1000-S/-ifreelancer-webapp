import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReceivedApplicationList from "@/components/ReceivedApplicationList";

export default async function ReceivedApplicationsPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const applications = await prisma.jobApplication.findMany({
    where: {
      job: {
        creatorId: session.user.id,
      },
    },
    include: {
      job: true,
      applicant: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Received Applications</h1>
      <ReceivedApplicationList initialApplications={applications} />
    </div>
  );
}
