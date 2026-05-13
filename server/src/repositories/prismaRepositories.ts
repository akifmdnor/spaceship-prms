import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type { CrewRole } from "../domain/Passenger.js";
import { Passenger } from "../domain/Passenger.js";
import { Resource } from "../domain/Resource.js";
import { TierLevel } from "../domain/TierLevel.js";
import type {
  AuditEntry,
  IAuditLogRepository,
  IResourceRepository,
  IUserRepository
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
