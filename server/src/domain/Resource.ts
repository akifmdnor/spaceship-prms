import { TierLevel } from "./TierLevel.js";

export class Resource {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly minRequiredTier: TierLevel,
    public readonly usageCount: number,
    public readonly capacityPercent: number,
    public readonly facilityBonus?: string
  ) {}

  withUsageDelta(delta: number): Resource {
    const next = Math.max(0, this.usageCount + delta);
    return new Resource(
      this.id,
      this.name,
      this.minRequiredTier,
      next,
      this.capacityPercent,
      this.facilityBonus
    );
  }
}
