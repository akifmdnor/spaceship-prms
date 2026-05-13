import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { TierLevel } from "../src/domain/TierLevel.js";
import { Passenger } from "../src/domain/Passenger.js";
import { CrewLeadRegistry } from "../src/domain/CrewLeadRegistry.js";
import {
  InMemoryAuditLogRepository,
  InMemoryResourceRepository,
  InMemoryUserRepository
} from "../src/repositories/InMemoryRepositories.js";
import { createApp } from "../src/app.js";

describe("Rule of Three — crew lead promotions (integration)", () => {
  beforeEach(() => {
    CrewLeadRegistry.resetForTests();
  });

  it("returns 403 when attempting to add a 4th Crew Lead", async () => {
    const users = new InMemoryUserRepository([
      new Passenger("u-admin", "Everest", TierLevel.PLATINUM, true, "crew_lead"),
      new Passenger("lead-1", "Rhea", TierLevel.GOLD, false, "crew_lead"),
      new Passenger("lead-2", "Morgan", TierLevel.PLATINUM, false, "crew_lead"),
      new Passenger("lead-3", "Kim", TierLevel.GOLD, false, "crew_lead"),
      new Passenger("u-new", "Nova", TierLevel.SILVER, false, "passenger")
    ]);

    const app = createApp({
      users,
      audit: new InMemoryAuditLogRepository(),
      resources: new InMemoryResourceRepository()
    });

    const res = await request(app)
      .post("/api/admin/crew-leads")
      .set("X-User-Id", "u-admin")
      .send({ userId: "u-new", requestedByAdminId: "u-admin" });

    expect(res.status).toBe(403);
    expect(String(res.body.message)).toMatch(/Rule of Three|maximum crew leads|slots full/i);
  });
});
