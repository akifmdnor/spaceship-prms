import { Router } from "express";
import type { ShipContainer } from "./shipContainer.js";

export function createAuditRoutes(container: ShipContainer): Router {
  const r = Router();

  r.get("/audit", async (req, res, next) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q : "";
      const entries = q
        ? await container.auditService.search(q)
        : await container.auditService.list(200);
      res.json(entries);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
