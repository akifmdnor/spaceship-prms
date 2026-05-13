import type { Passenger } from "../domain/Passenger.js";
import type { Resource } from "../domain/Resource.js";
import { TIER_LABEL, TierLevel } from "../domain/TierLevel.js";
import { TierStrategy } from "../domain/TierStrategy.js";
import type {
  IAuditLogRepository,
  IResourceRepository,
  IUsageEventRepository,
  IUserRepository
} from "../repositories/interfaces.js";

export class ResourceService {
  constructor(
    private readonly tierStrategy: TierStrategy,
    private readonly users: IUserRepository,
    private readonly resources: IResourceRepository,
    private readonly audit: IAuditLogRepository,
    private readonly usageEvents: IUsageEventRepository
  ) {}

  async authorizeResourceUse(userId: string, resourceId: string) {
    const user = await this.users.findById(userId);
    const resource = await this.resources.findById(resourceId);

    if (!user || !resource) {
      return { ok: false as const, status: 404 as const, error: "User or resource not found" };
    }

    if (!this.tierStrategy.canAccess(user.tier, resource.minRequiredTier)) {
      await this.recordTierDenied(user, resource);
      return {
        ok: false as const,
        status: 403 as const,
        responseBody: {
          error: "ACCESS_DENIED",
          message: "Your tier cannot access this facility.",
          details: {
            requiredTier: TIER_LABEL[resource.minRequiredTier as TierLevel],
            userTier: TIER_LABEL[user.tier as TierLevel]
          }
        },
        user,
        resource
      };
    }

    return { ok: true as const, user, resource };
  }

  private async recordTierDenied(user: Passenger, resource: Resource) {
    await this.audit.append({
      severity: "alert",
      message: `ALERT: User '${user.name}' (${TIER_LABEL[user.tier as TierLevel]}) attempted ${resource.name} — ACCESS DENIED.`
    });
    await this.usageEvents.record({
      userId: user.id,
      resourceId: resource.id,
      resourceName: resource.name,
      userTier: user.tier,
      outcome: "denied"
    });
  }

  async recordSuccessfulUse(user: Passenger, resource: Resource) {
    const updated = await this.resources.incrementUsage(resource.id, 1);
    await this.audit.append({
      severity: "success",
      message: `User '${user.name}' accessed ${resource.name}. (+1 Usage)`
    });
    await this.usageEvents.record({
      userId: user.id,
      resourceId: resource.id,
      resourceName: resource.name,
      userTier: user.tier,
      outcome: "success"
    });
    return { resource: updated ?? resource, user };
  }

  async attemptAccess(userId: string, resourceId: string) {
    const gate = await this.authorizeResourceUse(userId, resourceId);
    if (!gate.ok) {
      if (gate.status === 404) {
        return { ok: false as const, status: 404, error: gate.error };
      }
      return {
        ok: false as const,
        status: 403,
        error: "Access denied for current tier",
        user: { name: gate.user.name, tier: gate.user.tier },
        resource: { name: gate.resource.name, requiredTier: gate.resource.minRequiredTier }
      };
    }

    const { user, resource } = gate;
    const { resource: updated } = await this.recordSuccessfulUse(user, resource);
    return {
      ok: true as const,
      status: 200,
      resource: updated,
      user: { id: user.id, name: user.name, tier: user.tier }
    };
  }
}
