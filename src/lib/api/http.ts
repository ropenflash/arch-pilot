import { NextResponse } from "next/server";
import type { ApiErrorBody, ApiErrorCode } from "@/types/api";

export const MAX_REQUEST_BYTES = 512 * 1024;

export class HttpError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function jsonError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown,
) {
  const body: ApiErrorBody = {
    error: { code, message, details },
  };
  return NextResponse.json(body, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorFromUnknown(error: unknown) {
  if (error instanceof HttpError) {
    return jsonError(error.code, error.message, error.status, error.details);
  }
  console.error(error);
  return jsonError(
    "INTERNAL_ERROR",
    "An unexpected error occurred.",
    500,
  );
}

export async function readJsonBody(
  request: Request,
  maxBytes = MAX_REQUEST_BYTES,
): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new HttpError(
      "REQUEST_TOO_LARGE",
      `Request exceeds the ${maxBytes} byte limit.`,
      413,
    );
  }

  const text = await request.text();
  if (text.length > maxBytes) {
    throw new HttpError(
      "REQUEST_TOO_LARGE",
      `Request exceeds the ${maxBytes} byte limit.`,
      413,
    );
  }
  if (!text.trim()) {
    throw new HttpError("VALIDATION_ERROR", "Request body is required.", 400);
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HttpError("VALIDATION_ERROR", "Request body must be valid JSON.", 400);
  }
}
