import { z } from "zod";
import { CrewLeadRegistry } from "../domain/CrewLeadRegistry.js";
import type { Passenger } from "../domain/Passenger.js";
import { TierLevel } from "../domain/TierLevel.js";
import { TIER_LABEL } from "../domain/TierLevel.js";
import type { IAuditLogRepository, IUserRepository } from "../repositories/interfaces.js";

const promoteSchema = z.object({
  userId: z.string().min(1),
  requestedByAdminId: z.string().min(1)
});

const tierUpgradeSchema = z.object({
  targetUserId: z.string().min(1),
  newTier: z.nativeEnum(TierLevel),
  adminId: z.string().min(1)
});

export class AdminService {
  constructor(
    private readonly users: IUserRepository,
    private readonly audit: IAuditLogRepository,
    private readonly registry: CrewLeadRegistry
  ) {}

  async promoteToCrewLead(
    body: unknown
  ): Promise<
    | { ok: true; passenger: Passenger }
    | { ok: false; status: number; error: string }
  > {
    const parsed = promoteSchema.safeParse(body);
    if (!parsed.success) {
      return { ok: false, status: 400, error: "Invalid crew-lead promotion payload" };
    }

    const { userId, requestedByAdminId } = parsed.data;
    const admin = await this.users.findById(requestedByAdminId);
    if (!admin?.isAdmin) {
      return { ok: false, status: 403, error: "Only admins may register crew leads" };
    }

    const target = await this.users.findById(userId);
    if (!target) {
      return { ok: false, status: 404, error: "User not found" };
    }
    if (target.role === "crew_lead") {
      return { ok: false, status: 409, error: "User is already a crew lead" };
    }

    const count = await this.users.countCrewLeads();
    if (!this.registry.canRegisterCrewLead(count)) {
      return {
        ok: false,
        status: 403,
        error: "Rule of Three: crew lead slots are full (3/3)"
      };
    }

    const passenger = await this.users.promoteToCrewLead(userId);
    if (!passenger) {
      return { ok: false, status: 500, error: "Failed to promote user" };
    }

    await this.audit.append({
      severity: "admin",
      message: `ADMIN '${admin.name}' registered Crew Lead '${passenger.name}'.`
    });

    return { ok: true, passenger };
  }

  async upgradeTier(
    body: unknown
  ): Promise<
    | { ok: true; passenger: Passenger }
    | { ok: false; status: number; error: string }
  > {
    const parsed = tierUpgradeSchema.safeParse(body);
    if (!parsed.success) {
      return { ok: false, status: 400, error: "Invalid tier upgrade payload" };
    }

    const { targetUserId, newTier, adminId } = parsed.data;
    const admin = await this.users.findById(adminId);
    if (!admin?.isAdmin) {
      return { ok: false, status: 403, error: "Only admins may change tiers" };
    }

    const target = await this.users.findById(targetUserId);
    if (!target) {
      return { ok: false, status: 404, error: "User not found" };
    }

    const updated = await this.users.updateTier(targetUserId, newTier);
    if (!updated) {
      return { ok: false, status: 500, error: "Tier update failed" };
    }

    await this.audit.append({
      severity: "admin",
      message: `ADMIN '${admin.name}' upgraded User '${updated.name}' to ${TIER_LABEL[newTier]}. (Tier Change)`
    });

    return { ok: true, passenger: updated };
  }
}
