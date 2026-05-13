import { Router } from "express";
import { problemJson } from "../lib/httpError.js";
import type { ShipContainer } from "./shipContainer.js";

export function createReportRoutes(container: ShipContainer): Router {
  const r = Router();

  r.get("/me/usage", async (req, res, next) => {
    try {
      const raw = Number(req.query.limit);
      const limit = Number.isFinite(raw) ? Math.min(200, Math.max(1, raw)) : 50;
      const rows = await container.usageEvents.findByUserId(req.authUserId!, limit);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  });

  r.get("/reports/usage-by-tier", async (req, res, next) => {
    try {
      const me = await container.users.findById(req.authUserId!);
      if (!me || me.role !== "crew_lead") {
        return problemJson(res, 403, "FORBIDDEN", "Crew leads only");
      }
      const rows = await container.usageEvents.aggregateSuccessByTier();
      res.json(rows);
    } catch (e) {
      next(e);
    }
  });

  r.get("/reports/top-resources", async (req, res, next) => {
    try {
      const me = await container.users.findById(req.authUserId!);
      if (!me || me.role !== "crew_lead") {
        return problemJson(res, 403, "FORBIDDEN", "Crew leads only");
      }
      const raw = Number(req.query.limit);
      const limit = Number.isFinite(raw) ? Math.min(50, Math.max(1, raw)) : 10;
      const rows = await container.usageEvents.aggregateSuccessByResource(limit);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
