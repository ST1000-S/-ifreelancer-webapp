import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

async function sendApplicationStatusEmail(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  status: string
) {
  const subject = `Your application for "${jobTitle}" has been ${status.toLowerCase()}`;
  let content = "";

  switch (status) {
    case "ACCEPTED":
      content = `Congratulations ${applicantName}! Your application for "${jobTitle}" has been accepted. The employer will contact you soon with further details.`;
      break;
    case "REJECTED":
      content = `Dear ${applicantName}, Thank you for your interest in "${jobTitle}". Unfortunately, we have decided to move forward with other candidates at this time. We wish you the best in your job search.`;
      break;
    default:
      content = `Dear ${applicantName}, Your application for "${jobTitle}" is currently under review. We will notify you once a decision has been made.`;
  }

  await resend.emails.send({
    from: "iFreelancer <onboarding@resend.dev>",
    to: applicantEmail,
    subject,
    text: content,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await request.json();

    if (!["PENDING", "ACCEPTED", "REJECTED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: params.id },
      include: {
        job: {
          select: {
            creatorId: true,
            title: true,
          },
        },
        applicant: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    if (application.job.creatorId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: params.id },
      data: { status },
    });

    // Send email notification
    if (application.applicant.email) {
      await sendApplicationStatusEmail(
        application.applicant.email,
        application.applicant.name || "Applicant",
        application.job.title,
        status
      );
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error updating application status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
