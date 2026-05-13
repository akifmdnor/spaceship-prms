import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

function isTestAuth(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.PRMS_AUTH_TEST === "1"
  );
}

export function createRequireAuth(jwtSecret: string) {
  return function requireAuth(req: Request, res: Response, next: NextFunction): void {
    if (isTestAuth()) {
      const id = req.header("X-User-Id");
      if (!id || id.trim() === "") {
        res.status(401).json({ error: "Unauthorized (tests: pass X-User-Id)" });
        return;
      }
      req.authUserId = id.trim();
      next();
      return;
    }

    const hdr = req.headers.authorization;
    const token = hdr?.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) {
      res.status(401).json({ error: "Missing or invalid Authorization header" });
      return;
    }
    try {
      const p = jwt.verify(token, jwtSecret) as { sub?: string };
      if (!p.sub) {
        res.status(401).json({ error: "Invalid token payload" });
        return;
      }
      req.authUserId = p.sub;
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

export function createOptionalAuth(jwtSecret: string) {
  return function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    const hdr = req.headers.authorization;
    const token = hdr?.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) {
      next();
      return;
    }
    try {
      const p = jwt.verify(token, jwtSecret) as { sub?: string };
      if (p.sub) req.authUserId = p.sub;
    } catch {
      /* ignore */
    }
    next();
  };
}
