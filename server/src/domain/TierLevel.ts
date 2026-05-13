/** Numeric ordering enables open/closed tier extension (e.g. Diamond) without changing comparison logic. */
export enum TierLevel {
  SILVER = 0,
  GOLD = 1,
  PLATINUM = 2
}

export const TIER_LABEL: Record<TierLevel, string> = {
  [TierLevel.SILVER]: "SILVER",
  [TierLevel.GOLD]: "GOLD",
  [TierLevel.PLATINUM]: "PLATINUM"
};
