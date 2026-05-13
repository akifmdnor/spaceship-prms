import type { RequestHandler } from "express";
import { Router } from "express";
import type { ShipContainer } from "./shipContainer.js";

export function createAdminRoutes(container: ShipContainer, ruleOfThree: RequestHandler): Router {
  const r = Router();

  r.post("/admin/crew-leads", ruleOfThree, async (req, res, next) => {
    try {
      const adminId =
        typeof req.body?.requestedByAdminId === "string" ? req.body.requestedByAdminId : "";
      if (adminId !== req.authUserId) {
        return res.status(403).json({ error: "Admin session must match requestedByAdminId" });
      }
      const out = await container.adminService.promoteToCrewLead(req.body);
      if (!out.ok) {
        return res.status(out.status).json({ error: out.error });
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
        return res.status(403).json({ error: "Admin session must match adminId" });
      }
      const out = await container.adminService.upgradeTier(req.body);
      if (!out.ok) {
        return res.status(out.status).json({ error: out.error });
      }
      res.json(out.passenger);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
