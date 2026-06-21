import { NextResponse } from "next/server";
import type { ApiError } from "./types";

/**
 * Typed application error mapped to a standard HTTP envelope by route handlers.
 */
export class ApiException extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function makeRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

/**
 * Convert any thrown value into the standard error envelope response.
 * Known `ApiException`s keep their code/status; everything else is a 500.
 */
export function toErrorResponse(err: unknown, requestId: string): NextResponse {
  if (err instanceof ApiException) {
    const body: ApiError = {
      code: err.code,
      message: err.message,
      details: err.details,
      requestId,
    };
    return NextResponse.json(body, { status: err.status });
  }

  console.error(`[${requestId}] unhandled route error`, err);
  const body: ApiError = {
    code: "internal_error",
    message: "Beklenmeyen bir hata oluştu.",
    requestId,
  };
  return NextResponse.json(body, { status: 500 });
}
