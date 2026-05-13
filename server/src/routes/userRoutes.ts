import { Router } from "express";
import { TIER_LABEL } from "../domain/TierLevel.js";
import { problemJson } from "../lib/httpError.js";
import type { ShipContainer } from "./shipContainer.js";

export function createUserRoutes(container: ShipContainer): Router {
  const r = Router();

  r.get("/users", async (req, res, next) => {
    try {
      const me = await container.users.findById(req.authUserId!);
      if (!me) {
        return problemJson(res, 401, "UNAUTHORIZED", "Session user not found");
      }
      const list = me.role === "crew_lead" ? await container.users.findAll() : [me];
      res.json(
        list.map((u) => ({
          id: u.id,
          email: u.email ?? null,
          name: u.name,
          tier: u.tier,
          tierLabel: TIER_LABEL[u.tier],
          isAdmin: u.isAdmin,
          role: u.role
        }))
      );
    } catch (e) {
      next(e);
    }
  });

  return r;
}
