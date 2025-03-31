import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    // Create test users
    const clientPassword = await hash("password123", 12);
    const freelancerPassword = await hash("password123", 12);

    const client = await prisma.user.create({
      data: {
        name: "Test Client",
        email: "client@example.com",
        password: clientPassword,
        role: "CLIENT",
        profile: {
          create: {
            bio: "A test client looking for talented freelancers",
            skills: ["Project Management", "Business Analysis"],
            location: "New York, USA",
          },
        },
      },
    });

    const freelancer = await prisma.user.create({
      data: {
        name: "Test Freelancer",
        email: "freelancer@example.com",
        password: freelancerPassword,
        role: "FREELANCER",
        profile: {
          create: {
            bio: "Experienced full-stack developer",
            skills: ["React", "Node.js", "TypeScript"],
            hourlyRate: 50,
            location: "London, UK",
            github: "https://github.com/testfreelancer",
            linkedin: "https://linkedin.com/in/testfreelancer",
          },
        },
      },
    });

    // Create test jobs
    await prisma.job.create({
      data: {
        title: "React Developer Needed",
        description:
          "Looking for a React developer to build a modern web application",
        type: "REMOTE",
        budget: 5000,
        skills: ["React", "TypeScript", "Next.js"],
        status: "OPEN",
        creatorId: client.id,
      },
    });

    await prisma.job.create({
      data: {
        title: "Node.js Backend Developer",
        description: "Need help building a scalable backend API",
        type: "HYBRID",
        budget: 7000,
        skills: ["Node.js", "Express", "PostgreSQL"],
        status: "OPEN",
        creatorId: client.id,
      },
    });

    console.log("Database has been seeded. 🌱");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
