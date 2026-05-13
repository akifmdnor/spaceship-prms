import type { NextFunction, Request, Response } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : "Internal Server Error";
  const status = typeof (err as { status?: number }).status === "number"
    ? (err as { status: number }).status
    : 500;

  if (status >= 500) {
    // Structured log hook; avoid silent failures in production
    console.error("[PRMS]", err);
  }

  res.status(status).json({
    error: message
  });
}
