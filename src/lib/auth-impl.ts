import type { NextAuthOptions, DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { logger } from "./logger";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Adapter } from "next-auth/adapters";

export enum UserRole {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER",
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
  image?: string | null;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface NewUser {
  email: string;
  password: string;
  role: UserRole;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

export async function authorize(credentials: Credentials): Promise<User> {
  if (!credentials?.email || !credentials?.password) {
    const error = new Error("Email and password are required");
    logger.warn(error.message, { email: credentials?.email });
    throw error;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      const error = new Error("User not found");
      logger.warn(error.message, { email: credentials.email });
      throw error;
    }

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) {
      const error = new Error("Invalid credentials");
      logger.warn(error.message, { email: credentials.email });
      throw error;
    }

    logger.info("User authenticated successfully", { userId: user.id });
    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      image: user.image,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Authentication failed");
  }
}

export async function createUser(newUser: NewUser): Promise<User> {
  if (!isStrongPassword(newUser.password)) {
    const error = new Error("Password does not meet security requirements");
    logger.warn(error.message, { email: newUser.email });
    throw error;
  }

  try {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const userData: Prisma.UserCreateInput = {
      email: newUser.email,
      password: hashedPassword,
      role: newUser.role,
      name: "",
      profile: {
        create: {
          skills: [],
          languages: [],
          portfolio: {
            create: [],
          },
        },
      },
    };

    const user = await prisma.user.create({
      data: userData,
    });

    logger.info("New user created successfully", { userId: user.id });
    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      image: user.image,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      const duplicateError = new Error("Email already exists");
      logger.warn(duplicateError.message, { email: newUser.email });
      throw duplicateError;
    }
    const unknownError =
      error instanceof Error
        ? error
        : new Error("Unknown error during user creation");
    logger.error("Failed to create user", unknownError, {
      email: newUser.email,
    });
    throw unknownError;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          return await authorize(credentials);
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  callbacks: {
    async session({ session }) {
      if (!session.user?.id) {
        return session;
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
        });

        if (!dbUser) {
          const error = new Error(`User ${session.user.id} not found`);
          logger.error("Session creation failed", error, {
            userId: session.user.id,
          });
          return session;
        }

        if (!Object.values(UserRole).includes(dbUser.role as UserRole)) {
          const error = new Error(`Invalid role: ${dbUser.role}`);
          logger.error("Session creation failed", error, {
            userId: session.user.id,
            role: dbUser.role,
          });
          return session;
        }

        // Update session with user data
        session.user.id = dbUser.id;
        session.user.email = dbUser.email;
        session.user.role = dbUser.role as UserRole;
        session.user.name = dbUser.name;
        session.user.image = dbUser.image;

        return session;
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Unknown error during session handling");
        logger.error("Session creation failed", err, {
          userId: session.user.id,
        });
        return session;
      }
    },
  },
};
