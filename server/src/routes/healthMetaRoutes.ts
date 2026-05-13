import { Router } from "express";
import { TierLevel } from "../domain/TierLevel.js";

export function createPublicShipRoutes(): Router {
  const r = Router();

  r.get("/health", (_req, res) => {
    res.json({ status: "ok", ship: "X26-PRMS" });
  });

  r.get("/meta/tiers", (_req, res) => {
    res.json({
      order: [
        { level: TierLevel.SILVER, label: "SILVER" },
        { level: TierLevel.GOLD, label: "GOLD" },
        { level: TierLevel.PLATINUM, label: "PLATINUM" }
      ]
    });
  });

  return r;
}
