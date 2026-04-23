import { NextResponse } from "next/server";
import { AppError, ValidationError } from "./errors";

export function jsonResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error instanceof ValidationError && error.details
            ? { details: error.details }
            : {}),
        },
      },
      { status: error.statusCode },
    );
  }

  console.error("Unhandled error:", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    { status: 500 },
  );
}
