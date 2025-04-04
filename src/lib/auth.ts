import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "./prisma";
import { Logger } from "./logger";
import type { Adapter } from "next-auth/adapters";

const logger = Logger;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
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
  name: string;
}

declare module "next-auth" {
  interface Session {
    user: User;
  }

  interface JWT {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
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
  if (!credentials.email || !credentials.password) {
    const error = new Error("Email and password are required");
    logger.warn(error.message, { email: credentials.email });
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      name: true,
      image: true,
    },
  });

  if (!user || !user.email || !user.password) {
    const error = new Error("Invalid credentials");
    logger.warn("User not found or missing required fields", {
      email: credentials.email,
    });
    throw error;
  }

  const isValid = await bcrypt.compare(credentials.password, user.password);
  if (!isValid) {
    const error = new Error("Invalid credentials");
    logger.warn("Invalid password", { email: credentials.email });
    throw error;
  }

  logger.info("User authenticated successfully", { userId: user.id });
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    image: user.image,
  };
}

export async function createUser(newUser: NewUser): Promise<User> {
  if (!newUser.email || !newUser.password || !newUser.name) {
    const error = new Error("Email, password, and name are required");
    logger.warn(error.message);
    throw error;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newUser.email)) {
    const error = new Error("Invalid email format");
    logger.warn(error.message, { email: newUser.email });
    throw error;
  }

  if (!isStrongPassword(newUser.password)) {
    const error = new Error(
      "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters"
    );
    logger.warn(error.message, { email: newUser.email });
    throw error;
  }

  try {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const userData: Prisma.UserCreateInput = {
      email: newUser.email,
      password: hashedPassword,
      role: newUser.role,
      name: newUser.name,
      profile: {
        create: {
          title: "",
          bio: "",
        },
      },
    };

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        image: true,
      },
    });

    if (!user.email) {
      throw new Error("Failed to create user: email is required");
    }

    logger.info("New user created successfully", { userId: user.id });
    return {
      id: user.id,
      email: user.email,
      role: user.role,
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
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            logger.warn("Missing credentials");
            throw new Error("Email and password are required");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password: true,
              role: true,
              name: true,
              image: true,
            },
          });

          if (!user || !user.password) {
            logger.warn("User not found", { email: credentials.email });
            throw new Error("Invalid email or password");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValid) {
            logger.warn("Invalid password", { email: credentials.email });
            throw new Error("Invalid email or password");
          }

          logger.info("User authenticated successfully", { userId: user.id });
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          logger.error("Authentication error", error as Error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      } else if (trigger === "update" && session) {
        // Handle session updates
        return { ...token, ...session.user };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role as UserRole;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
