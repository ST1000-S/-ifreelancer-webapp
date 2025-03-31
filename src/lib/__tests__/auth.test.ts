import { jest } from "@jest/globals";
import { authorize, createUser, authOptions, UserRole } from "../auth";
import { prisma } from "../prisma";
import { logger } from "../logger";
import bcrypt from "bcryptjs";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Mock } from "jest-mock";
import type { User } from "@prisma/client";
import type { ILogger, LoggerMetadata } from "../logger";

// Mock types
type MockUser = Pick<
  User,
  | "id"
  | "email"
  | "password"
  | "role"
  | "name"
  | "image"
  | "emailVerified"
  | "createdAt"
  | "updatedAt"
>;

jest.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: jest.fn(() => ({
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByAccount: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    linkAccount: jest.fn(),
    unlinkAccount: jest.fn(),
    createSession: jest.fn(),
    getSessionAndUser: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    createVerificationToken: jest.fn(),
    useVerificationToken: jest.fn(),
  })),
}));

jest.mock("../prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    profile: {
      create: jest.fn(),
    },
  },
}));

const mockLogger: jest.Mocked<ILogger> = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

jest.mock("../logger", () => ({
  logger: mockLogger,
}));

const mockBcrypt = {
  compare: jest.fn(),
  hash: jest.fn(),
};

jest.mock("bcryptjs", () => mockBcrypt);

describe("Authentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authorize", () => {
    const mockUser: MockUser = {
      id: "user-123",
      email: "test@example.com",
      password: "hashedPassword",
      role: UserRole.FREELANCER,
      name: "Test User",
      image: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should authenticate valid credentials", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);

      const result = await authorize({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
        image: mockUser.image,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "User authenticated successfully",
        { userId: mockUser.id }
      );
    });

    it("should reject missing credentials", async () => {
      await expect(
        authorize({ email: "", password: "password123" })
      ).rejects.toThrow("Email and password are required");
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Email and password are required",
        { email: "" }
      );
    });

    it("should reject non-existent user", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authorize({ email: "nonexistent@example.com", password: "password123" })
      ).rejects.toThrow("User not found");
      expect(mockLogger.warn).toHaveBeenCalledWith("User not found", {
        email: "nonexistent@example.com",
      });
    });

    it("should reject invalid password", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      await expect(
        authorize({ email: "test@example.com", password: "wrongpassword" })
      ).rejects.toThrow("Invalid credentials");
      expect(mockLogger.warn).toHaveBeenCalledWith("Invalid credentials", {
        email: "test@example.com",
      });
    });

    // New edge case tests
    it("should handle database errors", async () => {
      const dbError = new Error("Database connection error");
      prisma.user.findUnique.mockRejectedValue(dbError);

      await expect(
        authorize({ email: "test@example.com", password: "password123" })
      ).rejects.toThrow("Database connection error");
    });

    it("should handle bcrypt comparison errors", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const bcryptError = new Error("Bcrypt error");
      mockBcrypt.compare.mockRejectedValue(bcryptError);

      await expect(
        authorize({ email: "test@example.com", password: "password123" })
      ).rejects.toThrow("Bcrypt error");
    });
  });

  describe("createUser", () => {
    const mockNewUser = {
      email: "new@example.com",
      password: "StrongP@ss123",
      role: UserRole.FREELANCER,
    };

    const mockCreatedUser = {
      id: "user-456",
      email: mockNewUser.email,
      password: "hashedPassword",
      role: mockNewUser.role,
      name: "",
      image: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create a new user with valid data", async () => {
      (bcrypt.hash as Mock).mockResolvedValue("hashedPassword");
      (prisma.user.create as Mock).mockResolvedValue(mockCreatedUser);

      const result = await createUser(mockNewUser);

      expect(result).toEqual({
        id: mockCreatedUser.id,
        email: mockCreatedUser.email,
        role: mockCreatedUser.role,
        name: mockCreatedUser.name,
        image: mockCreatedUser.image,
      });
      expect(logger.info).toHaveBeenCalledWith(
        "New user created successfully",
        {
          userId: mockCreatedUser.id,
        }
      );
    });

    // New edge case tests
    it("should handle password hashing errors", async () => {
      (bcrypt.hash as Mock).mockRejectedValue(new Error("Hashing failed"));

      await expect(createUser(mockNewUser)).rejects.toThrow("Hashing failed");
    });

    it("should validate email format", async () => {
      await expect(
        createUser({ ...mockNewUser, email: "invalid-email" })
      ).rejects.toThrow();
    });

    it("should handle database timeout", async () => {
      (bcrypt.hash as Mock).mockResolvedValue("hashedPassword");
      (prisma.user.create as Mock).mockRejectedValue(
        new Error("Database timeout")
      );

      await expect(createUser(mockNewUser)).rejects.toThrow("Database timeout");
    });
  });

  describe("Session Callback", () => {
    const mockSession: Session = {
      user: {
        id: "user-789",
        email: "session@example.com",
        role: UserRole.CLIENT,
        name: "Session User",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const mockToken: JWT = {
      id: "user-789",
      role: UserRole.CLIENT,
      name: "Session User",
      email: "session@example.com",
    };

    const mockDbUser = {
      id: "user-789",
      email: "session@example.com",
      password: "hashedPassword",
      role: UserRole.CLIENT,
      name: "Session User",
      image: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should handle valid session", async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(mockDbUser);

      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) {
        throw new Error("Session callback is not defined");
      }

      const result = await sessionCallback({
        session: mockSession,
        token: mockToken,
        trigger: "update",
        newSession: null,
      });

      expect(result.user?.role).toBe(mockDbUser.role);
      expect(logger.info).toHaveBeenCalledWith("Session created with role", {
        userId: mockDbUser.id,
        role: mockDbUser.role,
      });
    });

    // New edge case tests
    it("should handle database errors during session validation", async () => {
      (prisma.user.findUnique as Mock).mockRejectedValue(
        new Error("Database error")
      );

      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) {
        throw new Error("Session callback is not defined");
      }

      const result = await sessionCallback({
        session: mockSession,
        token: mockToken,
        trigger: "update",
        newSession: null,
      });

      expect(result).toBe(mockSession);
      expect(logger.error).toHaveBeenCalled();
    });

    it("should handle invalid user role in database", async () => {
      const invalidUser = {
        ...mockDbUser,
        role: "INVALID_ROLE" as UserRole,
      };
      (prisma.user.findUnique as Mock).mockResolvedValue(invalidUser);

      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) {
        throw new Error("Session callback is not defined");
      }

      const result = await sessionCallback({
        session: mockSession,
        token: mockToken,
        trigger: "update",
        newSession: null,
      });

      expect(result).toBe(mockSession);
      expect(logger.error).toHaveBeenCalledWith(
        "Error during session handling",
        expect.any(Error)
      );
    });
  });
});
