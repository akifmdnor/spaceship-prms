import type { RequestHandler } from "express";
import { Router } from "express";
import { createAuthTierMiddleware } from "../middleware/authTier.js";
import { createRuleOfThreeMiddleware } from "../middleware/ruleOfThree.js";
import { createAdminRoutes } from "./adminRoutes.js";
import { createAuditRoutes } from "./auditRoutes.js";
import { createPublicShipRoutes } from "./healthMetaRoutes.js";
import { createResourceRoutes } from "./resourceRoutes.js";
import { createReportRoutes } from "./reportRoutes.js";
import type { ShipContainer } from "./shipContainer.js";
import { createUserRoutes } from "./userRoutes.js";

export type { ShipContainer } from "./shipContainer.js";

export function createApiRouter(
  container: ShipContainer,
  options: { requireAuth: RequestHandler }
): Router {
  const { requireAuth } = options;
  const r = Router();

  r.use(createPublicShipRoutes());

  const authTier = createAuthTierMiddleware({
    resourceService: container.resourceService
  });
  const ruleOfThree = createRuleOfThreeMiddleware({
    users: container.users,
    registry: container.crewRegistry
  });

  const protectedRouter = Router();
  protectedRouter.use(requireAuth);
  protectedRouter.use(createUserRoutes(container));
  protectedRouter.use(createResourceRoutes(container, authTier));
  protectedRouter.use(createReportRoutes(container));
  protectedRouter.use(createAuditRoutes(container));
  protectedRouter.use(createAdminRoutes(container, ruleOfThree));

  r.use(protectedRouter);

  return r;
}
