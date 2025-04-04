import { test as setup } from "@playwright/test";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const TEST_USER = {
  email: "test@example.com",
  password: "Test@123",
  name: "Test User",
  role: UserRole.FREELANCER,
  image: null,
  emailVerified: null,
  rating: null,
  resetToken: null,
  resetTokenExpires: null,
};

setup("create test user", async () => {
  // Delete existing test user if any
  await prisma.user.deleteMany({
    where: { email: TEST_USER.email },
  });

  // Create test user
  const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
  await prisma.user.create({
    data: {
      email: TEST_USER.email,
      password: hashedPassword,
      name: TEST_USER.name,
      role: TEST_USER.role,
      image: TEST_USER.image,
      emailVerified: TEST_USER.emailVerified,
      rating: TEST_USER.rating,
      resetToken: TEST_USER.resetToken,
      resetTokenExpires: TEST_USER.resetTokenExpires,
      profile: {
        create: {
          title: "Test Profile",
          bio: "Test bio",
          hourlyRate: 50,
        },
      },
    },
  });
});
