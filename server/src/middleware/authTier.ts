import type { NextFunction, Request, Response } from "express";
import { TIER_LABEL } from "../domain/TierLevel.js";
import { TierStrategy } from "../domain/TierStrategy.js";
import type { IAuditLogRepository, IResourceRepository, IUserRepository } from "../repositories/interfaces.js";

export function createAuthTierMiddleware(deps: {
  users: IUserRepository;
  resources: IResourceRepository;
  audit: IAuditLogRepository;
  tierStrategy: TierStrategy;
}) {
  const { users, resources, audit, tierStrategy } = deps;

  return async function authTier(req: Request, res: Response, next: NextFunction) {
    const rawId = req.params.id;
    const resourceId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!resourceId) {
      return res.status(400).json({ error: "Missing resource id" });
    }

    const uidRaw = req.authUserId ?? req.header("X-User-Id");
    const userId = Array.isArray(uidRaw) ? uidRaw[0] : uidRaw;
    if (!userId || String(userId).trim() === "") {
      return res.status(401).json({ error: "Not authenticated for resource use" });
    }

    const user = await users.findById(String(userId));
    const resource = await resources.findById(resourceId);

    if (!user || !resource) {
      return res.status(404).json({ error: "User or resource not found" });
    }

    if (!tierStrategy.canAccess(user.tier, resource.minRequiredTier)) {
      await audit.append({
        severity: "alert",
        message: `ALERT: User '${user.name}' (${TIER_LABEL[user.tier]}) attempted ${resource.name} — ACCESS DENIED.`
      });
      return res.status(403).json({
        error: "Access denied",
        requiredTier: TIER_LABEL[resource.minRequiredTier],
        userTier: TIER_LABEL[user.tier]
      });
    }

    res.locals.shipUser = user;
    res.locals.shipResource = resource;
    next();
  };
}
