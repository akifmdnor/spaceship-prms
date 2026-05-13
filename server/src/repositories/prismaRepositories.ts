import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type { CrewRole } from "../domain/Passenger.js";
import { Passenger } from "../domain/Passenger.js";
import { Resource } from "../domain/Resource.js";
import { TierLevel, TIER_LABEL } from "../domain/TierLevel.js";
import type {
  AuditEntry,
  IAuditLogRepository,
  IResourceRepository,
  IUsageEventRepository,
  IUserRepository,
  UsageEventRecord,
  UsageOutcome
} from "./interfaces.js";

function toAud(m: { id: string; ts: Date; severity: string; message: string }): AuditEntry {
  return {
    id: m.id,
    ts: m.ts.toISOString(),
    severity: m.severity as AuditEntry["severity"],
    message: m.message
  };
}

export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly db: PrismaClient) {}

  async append(entry: Omit<AuditEntry, "id" | "ts">): Promise<AuditEntry> {
    const row = await this.db.auditLog.create({
      data: {
        id: randomUUID(),
        severity: entry.severity,
        message: entry.message
      }
    });
    return toAud(row);
  }

  async findRecent(limit: number): Promise<AuditEntry[]> {
    const rows = await this.db.auditLog.findMany({
      orderBy: { ts: "desc" },
      take: limit
    });
    return rows.map(toAud);
  }

  async search(query: string): Promise<AuditEntry[]> {
    const q = query.trim();
    if (!q) return this.findRecent(200);
    const rows = await this.db.auditLog.findMany({
      where: { message: { contains: q, mode: "insensitive" } },
      orderBy: { ts: "desc" },
      take: 200
    });
    return rows.map(toAud);
  }
}

export class PrismaResourceRepository implements IResourceRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(): Promise<Resource[]> {
    const rows = await this.db.resource.findMany();
    return rows.map(
      (r) =>
        new Resource(
          r.id,
          r.name,
          r.minRequiredTier as TierLevel,
          r.usageCount,
          r.capacityPercent,
          r.facilityBonus ?? undefined
        )
    );
  }

  async findById(id: string): Promise<Resource | undefined> {
    const r = await this.db.resource.findUnique({ where: { id } });
    if (!r) return undefined;
    return new Resource(
      r.id,
      r.name,
      r.minRequiredTier as TierLevel,
      r.usageCount,
      r.capacityPercent,
      r.facilityBonus ?? undefined
    );
  }

  async incrementUsage(id: string, delta: number): Promise<Resource | undefined> {
    try {
      const r = await this.db.resource.update({
        where: { id },
        data: { usageCount: { increment: delta } }
      });
      return new Resource(
        r.id,
        r.name,
        r.minRequiredTier as TierLevel,
        r.usageCount,
        r.capacityPercent,
        r.facilityBonus ?? undefined
      );
    } catch {
      return undefined;
    }
  }
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(): Promise<Passenger[]> {
    const rows = await this.db.user.findMany();
    return rows.map(
      (u) =>
        new Passenger(
          u.id,
          u.name,
          u.tier as TierLevel,
          u.isAdmin,
          u.role as CrewRole,
          u.email
        )
    );
  }

  async findById(id: string): Promise<Passenger | undefined> {
    const u = await this.db.user.findUnique({ where: { id } });
    if (!u) return undefined;
    return new Passenger(u.id, u.name, u.tier as TierLevel, u.isAdmin, u.role as CrewRole, u.email);
  }

  async findByEmail(email: string): Promise<Passenger | undefined> {
    const u = await this.db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (!u) return undefined;
    return new Passenger(u.id, u.name, u.tier as TierLevel, u.isAdmin, u.role as CrewRole, u.email);
  }

  async countCrewLeads(): Promise<number> {
    return this.db.user.count({ where: { role: "crew_lead" } });
  }

  async promoteToCrewLead(userId: string): Promise<Passenger | undefined> {
    try {
      const u = await this.db.user.update({
        where: { id: userId },
        data: { role: "crew_lead" }
      });
      return new Passenger(u.id, u.name, u.tier as TierLevel, u.isAdmin, "crew_lead", u.email);
    } catch {
      return undefined;
    }
  }

  async updateTier(userId: string, tier: TierLevel): Promise<Passenger | undefined> {
    try {
      const u = await this.db.user.update({
        where: { id: userId },
        data: { tier }
      });
      return new Passenger(u.id, u.name, u.tier as TierLevel, u.isAdmin, u.role as CrewRole, u.email);
    } catch {
      return undefined;
    }
  }
}

export class PrismaUsageEventRepository implements IUsageEventRepository {
  constructor(private readonly db: PrismaClient) {}

  async record(entry: {
    userId: string;
    resourceId: string;
    resourceName: string;
    userTier: number;
    outcome: UsageOutcome;
  }): Promise<void> {
    await this.db.resourceUsageEvent.create({
      data: {
        userId: entry.userId,
        resourceId: entry.resourceId,
        userTier: entry.userTier,
        outcome: entry.outcome
      }
    });
  }

  async findByUserId(userId: string, limit: number): Promise<UsageEventRecord[]> {
    const rows = await this.db.resourceUsageEvent.findMany({
      where: { userId },
      orderBy: { ts: "desc" },
      take: limit,
      include: { resource: { select: { name: true } } }
    });
    return rows.map((r) => ({
      id: r.id,
      ts: r.ts.toISOString(),
      userId: r.userId,
      resourceId: r.resourceId,
      resourceName: r.resource.name,
      outcome: r.outcome as UsageOutcome
    }));
  }

  async aggregateSuccessByTier(): Promise<{ tier: number; label: string; count: number }[]> {
    const rows = await this.db.resourceUsageEvent.groupBy({
      by: ["userTier"],
      where: { outcome: "success" },
      _count: { id: true },
      orderBy: { userTier: "asc" }
    });
    return rows.map((r) => ({
      tier: r.userTier,
      label: TIER_LABEL[r.userTier as TierLevel] ?? String(r.userTier),
      count: r._count.id
    }));
  }

  async aggregateSuccessByResource(
    limit: number
  ): Promise<{ resourceId: string; resourceName: string; count: number }[]> {
    const capped = Math.min(500, Math.max(1, limit));
    const grouped = await this.db.resourceUsageEvent.groupBy({
      by: ["resourceId"],
      where: { outcome: "success" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: capped
    });
    const ids = grouped.map((g) => g.resourceId);
    const names = await this.db.resource.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true }
    });
    const nameById = new Map(names.map((n) => [n.id, n.name] as const));
    return grouped.map((g) => ({
      resourceId: g.resourceId,
      resourceName: nameById.get(g.resourceId) ?? g.resourceId,
      count: g._count.id
    }));
  }
}
