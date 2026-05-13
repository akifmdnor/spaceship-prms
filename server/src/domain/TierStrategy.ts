import { TierLevel } from "./TierLevel.js";

/**
 * Strategy for resource access: higher tier inherits all lower-tier entitlements (Platinum ≥ Gold ≥ Silver).
 */
export class TierStrategy {
  canAccess(userTier: TierLevel, requiredTier: TierLevel): boolean {
    return userTier >= requiredTier;
  }

  /** Rank for logging / API responses */
  rank(tier: TierLevel): number {
    return tier;
  }
}
