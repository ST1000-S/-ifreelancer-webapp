import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Keep track of the connection
    const userId = session.user.id;

    // Initial message
    const initialData = {
      type: "connection",
      message: "Connected to status updates stream",
    };
    await writer.write(
      encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
    );

    // Subscribe to application updates
    const interval = setInterval(async () => {
      try {
        const applications = await prisma.jobApplication.findMany({
          where: {
            OR: [{ applicantId: userId }, { job: { creatorId: userId } }],
            updatedAt: {
              gt: new Date(Date.now() - 5000), // Last 5 seconds
            },
          },
          include: {
            job: {
              select: {
                title: true,
                creatorId: true,
              },
            },
            applicant: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });

        if (applications.length > 0) {
          const updates = applications.map((app) => ({
            type: "status-update",
            applicationId: app.id,
            status: app.status,
            jobTitle: app.job.title,
            updatedAt: app.updatedAt,
          }));

          await writer.write(
            encoder.encode(`data: ${JSON.stringify(updates)}\n\n`)
          );
        }
      } catch (error) {
        console.error("Error fetching updates:", error);
      }
    }, 5000);

    // Handle client disconnect
    request.signal.addEventListener("abort", () => {
      clearInterval(interval);
      writer.close();
    });

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error setting up SSE:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
