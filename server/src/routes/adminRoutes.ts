import type { RequestHandler } from "express";
import { Router } from "express";
import { problemJson, statusFallbackCode } from "../lib/httpError.js";
import type { ShipContainer } from "./shipContainer.js";

export function createAdminRoutes(container: ShipContainer, ruleOfThree: RequestHandler): Router {
  const r = Router();

  r.post("/admin/crew-leads", ruleOfThree, async (req, res, next) => {
    try {
      const adminId =
        typeof req.body?.requestedByAdminId === "string" ? req.body.requestedByAdminId : "";
      if (adminId !== req.authUserId) {
        return problemJson(res, 403, "FORBIDDEN", "Admin session must match requestedByAdminId");
      }
      const out = await container.adminService.promoteToCrewLead(req.body);
      if (!out.ok) {
        return problemJson(res, out.status, statusFallbackCode(out.status), out.error);
      }
      res.status(201).json(out.passenger);
    } catch (e) {
      next(e);
    }
  });

  r.post("/admin/tier-upgrade", async (req, res, next) => {
    try {
      const adminId = typeof req.body?.adminId === "string" ? req.body.adminId : "";
      if (adminId !== req.authUserId) {
        return problemJson(res, 403, "FORBIDDEN", "Admin session must match adminId");
      }
      const out = await container.adminService.upgradeTier(req.body);
      if (!out.ok) {
        return problemJson(res, out.status, statusFallbackCode(out.status), out.error);
      }
      res.json(out.passenger);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
