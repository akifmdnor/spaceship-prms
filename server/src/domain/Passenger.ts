import { TierLevel } from "./TierLevel.js";

export type CrewRole = "passenger" | "crew_lead";

export class Passenger {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public tier: TierLevel,
    public readonly isAdmin: boolean,
    public role: CrewRole,
    public readonly email?: string
  ) {}

  withTier(tier: TierLevel): Passenger {
    return new Passenger(this.id, this.name, tier, this.isAdmin, this.role, this.email);
  }

  withRole(role: CrewRole): Passenger {
    return new Passenger(this.id, this.name, this.tier, this.isAdmin, role, this.email);
  }
}
