import type { Passenger } from "../domain/Passenger.js";
import type { Resource } from "../domain/Resource.js";
import { TierStrategy } from "../domain/TierStrategy.js";
import type {
  IAuditLogRepository,
  IResourceRepository,
  IUserRepository
} from "../repositories/interfaces.js";

export class ResourceService {
  constructor(
    private readonly tierStrategy: TierStrategy,
    private readonly users: IUserRepository,
    private readonly resources: IResourceRepository,
    private readonly audit: IAuditLogRepository
  ) {}

  /** Persist usage + success audit after authTier middleware has allowed the request */
  async recordSuccessfulUse(user: Passenger, resource: Resource) {
    const updated = await this.resources.incrementUsage(resource.id, 1);
    await this.audit.append({
      severity: "success",
      message: `User '${user.name}' accessed ${resource.name}. (+1 Usage)`
    });
    return { resource: updated ?? resource, user };
  }

  /** Used by tests and non-HTTP callers: single orchestration of tier check + side effects */
  async attemptAccess(userId: string, resourceId: string) {
    const user = await this.users.findById(userId);
    const resource = await this.resources.findById(resourceId);

    if (!user || !resource) {
      return { ok: false as const, status: 404, error: "User or resource not found" };
    }

    const allowed = this.tierStrategy.canAccess(user.tier, resource.minRequiredTier);
    if (!allowed) {
      await this.audit.append({
        severity: "alert",
        message: `ALERT: User '${user.name}' attempted ${resource.name} — ACCESS DENIED.`
      });
      return {
        ok: false as const,
        status: 403,
        error: "Access denied for current tier",
        user: { name: user.name, tier: user.tier },
        resource: { name: resource.name, requiredTier: resource.minRequiredTier }
      };
    }

    const { resource: updated } = await this.recordSuccessfulUse(user, resource);
    return {
      ok: true as const,
      status: 200,
      resource: updated,
      user: { id: user.id, name: user.name, tier: user.tier }
    };
  }
}
