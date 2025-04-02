import { NextResponse } from "next/server";
import { logger } from "./logger";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
  };
}

export function handleAPIError(error: unknown): NextResponse<ErrorResponse> {
  // Log the error
  logger.error("API Error:", error as Error);

  // Handle known error types
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          message: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors,
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          {
            error: {
              message: "A unique constraint would be violated.",
              code: "UNIQUE_CONSTRAINT_VIOLATION",
            },
          },
          { status: 409 }
        );
      case "P2025":
        return NextResponse.json(
          {
            error: {
              message: "Record not found.",
              code: "NOT_FOUND",
            },
          },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          {
            error: {
              message: "Database error occurred.",
              code: "DATABASE_ERROR",
            },
          },
          { status: 500 }
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: {
          message: "Invalid data provided.",
          code: "VALIDATION_ERROR",
        },
      },
      { status: 400 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        message: "An unexpected error occurred.",
        code: "INTERNAL_SERVER_ERROR",
      },
    },
    { status: 500 }
  );
}

export function createAPIError(
  message: string,
  statusCode: number = 500,
  code?: string
): APIError {
  return new APIError(message, statusCode, code);
}
