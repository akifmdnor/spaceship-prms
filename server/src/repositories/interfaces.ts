import type { Passenger } from "../domain/Passenger.js";
import type { Resource } from "../domain/Resource.js";
import type { TierLevel } from "../domain/TierLevel.js";

export type AuditSeverity = "success" | "alert" | "admin";

export interface AuditEntry {
  id: string;
  ts: string;
  severity: AuditSeverity;
  message: string;
}

export interface IUserRepository {
  findAll(): Promise<Passenger[]>;
  findById(id: string): Promise<Passenger | undefined>;
  findByEmail(email: string): Promise<Passenger | undefined>;
  countCrewLeads(): Promise<number>;
  promoteToCrewLead(userId: string): Promise<Passenger | undefined>;
  updateTier(userId: string, tier: TierLevel): Promise<Passenger | undefined>;
}

export interface IResourceRepository {
  findAll(): Promise<Resource[]>;
  findById(id: string): Promise<Resource | undefined>;
  incrementUsage(id: string, delta: number): Promise<Resource | undefined>;
}

export interface IAuditLogRepository {
  append(entry: Omit<AuditEntry, "id" | "ts">): Promise<AuditEntry>;
  findRecent(limit: number): Promise<AuditEntry[]>;
  search(query: string): Promise<AuditEntry[]>;
}

export type UsageOutcome = "success" | "denied";

export interface UsageEventRecord {
  id: string;
  ts: string;
  userId: string;
  resourceId: string;
  resourceName: string;
  outcome: UsageOutcome;
}

export interface IUsageEventRepository {
  record(entry: {
    userId: string;
    resourceId: string;
    resourceName: string;
    userTier: number;
    outcome: UsageOutcome;
  }): Promise<void>;
  findByUserId(userId: string, limit: number): Promise<UsageEventRecord[]>;
  aggregateSuccessByTier(): Promise<{ tier: number; label: string; count: number }[]>;
  aggregateSuccessByResource(limit: number): Promise<
    { resourceId: string; resourceName: string; count: number }[]
  >;
}
