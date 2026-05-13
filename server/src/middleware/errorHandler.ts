import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError, problemJson, statusFallbackCode } from "../lib/httpError.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return problemJson(res, err.status, err.code, err.message, err.details);
  }
  if (err instanceof ZodError) {
    return problemJson(res, 400, "BAD_REQUEST", "Validation failed", err.flatten());
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";
  const status =
    typeof (err as { status?: number }).status === "number"
      ? (err as { status: number }).status
      : 500;

  if (status >= 500) {
    console.error("[PRMS]", err);
    return problemJson(res, 500, "INTERNAL_ERROR", "Internal Server Error");
  }

  return problemJson(res, status, statusFallbackCode(status), message);
}
