import type { RequestHandler } from "express";
import { Router } from "express";
import { TIER_LABEL } from "../domain/TierLevel.js";
import type { ShipContainer } from "./shipContainer.js";

export function createResourceRoutes(
  container: ShipContainer,
  authTier: RequestHandler
): Router {
  const r = Router();

  r.get("/resources", async (req, res, next) => {
    try {
      const me = await container.users.findById(req.authUserId!);
      if (!me) {
        return res.status(401).json({ error: "Session user not found" });
      }
      if (me.role !== "crew_lead") {
        return res.status(403).json({ error: "Full resource catalog requires crew lead role" });
      }
      const all = await container.resources.findAll();
      res.json(
        all.map((x) => ({
          id: x.id,
          name: x.name,
          minRequiredTier: x.minRequiredTier,
          minRequiredLabel: TIER_LABEL[x.minRequiredTier],
          usageCount: x.usageCount,
          capacityPercent: x.capacityPercent,
          facilityBonus: x.facilityBonus
        }))
      );
    } catch (e) {
      next(e);
    }
  });

  r.get("/resources/accessible", async (req, res, next) => {
    try {
      const me = await container.users.findById(req.authUserId!);
      if (!me) {
        return res.status(401).json({ error: "Session user not found" });
      }
      const all = await container.resources.findAll();
      const visible = all.filter((x) => container.tierStrategy.canAccess(me.tier, x.minRequiredTier));
      res.json(
        visible.map((x) => ({
          id: x.id,
          name: x.name,
          minRequiredTier: x.minRequiredTier,
          minRequiredLabel: TIER_LABEL[x.minRequiredTier],
          usageCount: x.usageCount,
          capacityPercent: x.capacityPercent,
          facilityBonus: x.facilityBonus
        }))
      );
    } catch (e) {
      next(e);
    }
  });

  r.post("/resources/:id/use", authTier, async (req, res, next) => {
    try {
      const user = res.locals.shipUser!;
      const resource = res.locals.shipResource!;
      const result = await container.resourceService.recordSuccessfulUse(user, resource);
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
