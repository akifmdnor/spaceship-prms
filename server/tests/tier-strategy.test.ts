import { describe, expect, it } from "vitest";
import { TierLevel } from "../src/domain/TierLevel.js";
import { TierStrategy } from "../src/domain/TierStrategy.js";

describe("TierStrategy", () => {
  const strategy = new TierStrategy();

  it("allows Silver for Silver-gated resources", () => {
    expect(strategy.canAccess(TierLevel.SILVER, TierLevel.SILVER)).toBe(true);
  });

  it("denies Silver for Platinum-gated resources", () => {
    expect(strategy.canAccess(TierLevel.SILVER, TierLevel.PLATINUM)).toBe(false);
  });

  it("allows Platinum for Gold-gated resources (inheritance)", () => {
    expect(strategy.canAccess(TierLevel.PLATINUM, TierLevel.GOLD)).toBe(true);
  });

  it("ranks tiers monotonically for open/closed extension", () => {
    expect(strategy.rank(TierLevel.PLATINUM)).toBeGreaterThan(strategy.rank(TierLevel.GOLD));
  });
});
