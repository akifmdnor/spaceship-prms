import type { RequestHandler } from "express";
import { Router } from "express";
import { TierLevel, TIER_LABEL } from "../domain/TierLevel.js";
import type { TierStrategy } from "../domain/TierStrategy.js";
import type { CrewLeadRegistry } from "../domain/CrewLeadRegistry.js";
import type { AdminService } from "../services/AdminService.js";
import type { AuditLogService } from "../services/AuditLogService.js";
import type { ResourceService } from "../services/ResourceService.js";
import type {
  IAuditLogRepository,
  IUserRepository,
  IResourceRepository
} from "../repositories/interfaces.js";
import { createAuthTierMiddleware } from "../middleware/authTier.js";
import { createRuleOfThreeMiddleware } from "../middleware/ruleOfThree.js";

export interface ShipContainer {
  tierStrategy: TierStrategy;
  users: IUserRepository;
  resources: IResourceRepository;
  audit: IAuditLogRepository;
  crewRegistry: CrewLeadRegistry;
  resourceService: ResourceService;
  adminService: AdminService;
  auditService: AuditLogService;
}

export function createApiRouter(
  container: ShipContainer,
  options: { requireAuth: RequestHandler }
): Router {
  const { requireAuth } = options;
  const r = Router();
  const authTier = createAuthTierMiddleware({
    users: container.users,
    resources: container.resources,
    audit: container.audit,
    tierStrategy: container.tierStrategy
  });
  const ruleOfThree = createRuleOfThreeMiddleware({
    users: container.users,
    registry: container.crewRegistry
  });

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

  r.use(requireAuth);

  r.get("/users", async (req, res, next) => {
    try {
      const me = await container.users.findById(req.authUserId!);
      if (!me) {
        return res.status(401).json({ error: "Session user not found" });
      }
      const list = me.isAdmin ? await container.users.findAll() : [me];
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

  r.get("/resources", async (_req, res, next) => {
    try {
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
