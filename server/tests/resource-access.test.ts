import { describe, expect, it, beforeEach } from "vitest";
import { TierLevel } from "../src/domain/TierLevel.js";
import { Passenger } from "../src/domain/Passenger.js";
import { Resource } from "../src/domain/Resource.js";
import { CrewLeadRegistry } from "../src/domain/CrewLeadRegistry.js";
import {
  InMemoryAuditLogRepository,
  InMemoryResourceRepository,
  InMemoryUsageEventRepository,
  InMemoryUserRepository
} from "../src/repositories/InMemoryRepositories.js";
import { TierStrategy } from "../src/domain/TierStrategy.js";
import { ResourceService } from "../src/services/ResourceService.js";

describe("ResourceService.access", () => {
  beforeEach(() => {
    CrewLeadRegistry.resetForTests();
  });

  it("denies Silver user accessing Platinum pod (repository + audit side effect)", async () => {
    const users = new InMemoryUserRepository([
      new Passenger("u1", "Tester", TierLevel.SILVER, false, "passenger")
    ]);
    const resources = new InMemoryResourceRepository([
      new Resource("vip", "VIP Rec Deck", TierLevel.PLATINUM, 0, 0)
    ]);
    const audit = new InMemoryAuditLogRepository();
    const usage = new InMemoryUsageEventRepository();
    const svc = new ResourceService(new TierStrategy(), users, resources, audit, usage);

    const result = await svc.attemptAccess("u1", "vip");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }

    const logs = await audit.findRecent(5);
    expect(logs.some((l) => l.severity === "alert")).toBe(true);

    const denied = await usage.findByUserId("u1", 5);
    expect(denied.some((e) => e.outcome === "denied" && e.resourceId === "vip")).toBe(true);
  });

  it("allows Platinum user to access Gold-gated medical bay", async () => {
    const users = new InMemoryUserRepository([
      new Passenger("u2", "VIP", TierLevel.PLATINUM, false, "passenger")
    ]);
    const resources = new InMemoryResourceRepository([
      new Resource("med", "Medical Bay", TierLevel.GOLD, 1, 40)
    ]);
    const audit = new InMemoryAuditLogRepository();
    const usage = new InMemoryUsageEventRepository();
    const svc = new ResourceService(new TierStrategy(), users, resources, audit, usage);

    const result = await svc.attemptAccess("u2", "med");
    expect(result.ok).toBe(true);

    const events = await usage.findByUserId("u2", 5);
    expect(events.some((e) => e.outcome === "success" && e.resourceId === "med")).toBe(true);
  });
});
