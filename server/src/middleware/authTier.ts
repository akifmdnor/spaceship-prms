import type { NextFunction, Request, Response } from "express";
import { problemJson } from "../lib/httpError.js";
import type { ResourceService } from "../services/ResourceService.js";

export function createAuthTierMiddleware(deps: { resourceService: ResourceService }) {
  return async function authTier(req: Request, res: Response, next: NextFunction) {
    const rawId = req.params.id;
    const resourceId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!resourceId) {
      return problemJson(res, 400, "BAD_REQUEST", "Missing resource id");
    }

    const uidRaw = req.authUserId ?? req.header("X-User-Id");
    const userId = Array.isArray(uidRaw) ? uidRaw[0] : uidRaw;
    if (!userId || String(userId).trim() === "") {
      return problemJson(res, 401, "UNAUTHORIZED", "Not authenticated for resource use");
    }

    const gate = await deps.resourceService.authorizeResourceUse(String(userId), resourceId);

    if (!gate.ok) {
      if (gate.status === 404) {
        return problemJson(res, 404, "NOT_FOUND", gate.error);
      }
      const { responseBody } = gate;
      return problemJson(res, 403, responseBody.error, responseBody.message, responseBody.details);
    }

    res.locals.shipUser = gate.user;
    res.locals.shipResource = gate.resource;
    next();
  };
}
