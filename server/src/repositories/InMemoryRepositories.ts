import { randomUUID } from "node:crypto";
import { Passenger } from "../domain/Passenger.js";
import { Resource } from "../domain/Resource.js";
import { TierLevel } from "../domain/TierLevel.js";
import type {
  AuditEntry,
  IAuditLogRepository,
  IResourceRepository,
  IUserRepository
} from "./interfaces.js";

const now = () => new Date().toISOString();

/** AI-scaffolded mock data; domain rules are enforced in services/middleware. */
export function seedUsers(): Passenger[] {
  return [
    new Passenger("u-afni", "Afni", TierLevel.SILVER, false, "passenger", "afni@prms.local"),
    new Passenger("u-zoe", "Zoe", TierLevel.SILVER, false, "passenger", "zoe@prms.local"),
    new Passenger("u-everest", "Everest", TierLevel.PLATINUM, true, "passenger", "everest@prms.local"),
    new Passenger("u-jack", "Jack", TierLevel.GOLD, false, "passenger", "jack@prms.local"),
    new Passenger("u-lead-1", "Rhea", TierLevel.GOLD, false, "crew_lead", "rhea@prms.local"),
    new Passenger("u-lead-2", "Morgan", TierLevel.PLATINUM, false, "crew_lead", "morgan@prms.local"),
    new Passenger("u-lead-3", "Kim", TierLevel.GOLD, false, "crew_lead", "kim@prms.local")
  ];
}

export function seedResources(): Resource[] {
  return [
    new Resource("r-food-04", "Food Station 04", TierLevel.SILVER, 42, 72, "+3 Usage"),
    new Resource("r-pod-a12", "Sleeping Pod A-12", TierLevel.SILVER, 18, 54, "+3 Usage"),
    new Resource("r-med", "Medical Bay", TierLevel.GOLD, 7, 38),
    new Resource("r-cabin", "Private Cabins", TierLevel.GOLD, 0, 0),
    new Resource("r-vip", "VIP Rec Deck", TierLevel.PLATINUM, 3, 90),
    new Resource("r-bridge", "Observation Bridge", TierLevel.PLATINUM, 1, 20)
  ];
}

export class InMemoryUserRepository implements IUserRepository {
  private users: Passenger[];

  constructor(seed?: Passenger[]) {
    this.users = seed ? seed.map((p) => p) : seedUsers();
  }

  async findAll(): Promise<Passenger[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<Passenger | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async findByEmail(email: string): Promise<Passenger | undefined> {
    const e = email.toLowerCase().trim();
    return this.users.find((u) => u.email?.toLowerCase() === e);
  }

  async countCrewLeads(): Promise<number> {
    return this.users.filter((u) => u.role === "crew_lead").length;
  }

  async promoteToCrewLead(userId: string): Promise<Passenger | undefined> {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) return undefined;
    const next = this.users[idx]!.withRole("crew_lead");
    this.users[idx] = next;
    return next;
  }

  async updateTier(userId: string, tier: TierLevel): Promise<Passenger | undefined> {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) return undefined;
    this.users[idx] = this.users[idx]!.withTier(tier);
    return this.users[idx];
  }

  /** Test helper */
  _reset(users: Passenger[]): void {
    this.users = users.map((p) => p);
  }
}

export class InMemoryResourceRepository implements IResourceRepository {
  private resources: Resource[];

  constructor(seed?: Resource[]) {
    this.resources = seed ? seed.map((r) => r) : seedResources();
  }

  async findAll(): Promise<Resource[]> {
    return [...this.resources];
  }

  async findById(id: string): Promise<Resource | undefined> {
    return this.resources.find((r) => r.id === id);
  }

  async incrementUsage(id: string, delta: number): Promise<Resource | undefined> {
    const idx = this.resources.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.resources[idx] = this.resources[idx]!.withUsageDelta(delta);
    return this.resources[idx];
  }

  _reset(resources: Resource[]): void {
    this.resources = resources.map((r) => r);
  }
}

export class InMemoryAuditLogRepository implements IAuditLogRepository {
  private entries: AuditEntry[] = [];

  /** Synchronous seed for demo / dev (newest entries last in array = shown first after prepends in append) */
  seedDemo(lines: Omit<AuditEntry, "id" | "ts">[]): void {
    let t = Date.now();
    for (const line of lines) {
      this.entries.unshift({
        ...line,
        id: randomUUID(),
        ts: new Date((t -= 60_000)).toISOString()
      });
    }
  }

  async append(entry: Omit<AuditEntry, "id" | "ts">): Promise<AuditEntry> {
    const full: AuditEntry = {
      ...entry,
      id: randomUUID(),
      ts: now()
    };
    this.entries.unshift(full);
    return full;
  }

  async findRecent(limit: number): Promise<AuditEntry[]> {
    return this.entries.slice(0, limit);
  }

  async search(query: string): Promise<AuditEntry[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.findRecent(200);
    return this.entries.filter((e) => e.message.toLowerCase().includes(q));
  }

  _reset(seed?: AuditEntry[]): void {
    this.entries = seed ? [...seed] : [];
  }
}
