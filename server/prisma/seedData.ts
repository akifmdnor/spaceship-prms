import { TierLevel } from "../src/domain/TierLevel.js";

export type CrewRole = "passenger" | "crew_lead";

/** Plaintext demo passwords — only for local/demo; referenced by frontend login hint */
export const SEED_ACCOUNTS: {
  id: string;
  email: string;
  password: string;
  name: string;
  tier: TierLevel;
  isAdmin: boolean;
  role: CrewRole;
  hint: string;
}[] = [
  {
    id: "u-afni",
    email: "afni@prms.local",
    password: "silver-demo",
    name: "Afni",
    tier: TierLevel.SILVER,
    isAdmin: false,
    role: "passenger",
    hint: "Silver passenger (default story)"
  },
  {
    id: "u-zoe",
    email: "zoe@prms.local",
    password: "silver-demo",
    name: "Zoe",
    tier: TierLevel.SILVER,
    isAdmin: false,
    role: "passenger",
    hint: "Silver passenger"
  },
  {
    id: "u-everest",
    email: "everest@prms.local",
    password: "admin-demo",
    name: "Everest",
    tier: TierLevel.PLATINUM,
    isAdmin: true,
    role: "passenger",
    hint: "Admin — full mission roster + tier upgrades"
  },
  {
    id: "u-jack",
    email: "jack@prms.local",
    password: "gold-demo",
    name: "Jack",
    tier: TierLevel.GOLD,
    isAdmin: false,
    role: "passenger",
    hint: "Gold passenger"
  },
  {
    id: "u-lead-1",
    email: "rhea@prms.local",
    password: "crew-demo",
    name: "Rhea",
    tier: TierLevel.GOLD,
    isAdmin: false,
    role: "crew_lead",
    hint: "Crew lead (1/3 slots)"
  },
  {
    id: "u-lead-2",
    email: "morgan@prms.local",
    password: "crew-demo",
    name: "Morgan",
    tier: TierLevel.PLATINUM,
    isAdmin: false,
    role: "crew_lead",
    hint: "Crew lead (2/3 slots)"
  },
  {
    id: "u-lead-3",
    email: "kim@prms.local",
    password: "crew-demo",
    name: "Kim",
    tier: TierLevel.GOLD,
    isAdmin: false,
    role: "crew_lead",
    hint: "Crew lead (3/3 slots — Rule of Three)"
  }
];

export const SEED_RESOURCES = [
  {
    id: "r-food-04",
    name: "Food Station 04",
    minRequiredTier: TierLevel.SILVER,
    usageCount: 42,
    capacityPercent: 72,
    facilityBonus: "+3 Usage"
  },
  {
    id: "r-pod-a12",
    name: "Sleeping Pod A-12",
    minRequiredTier: TierLevel.SILVER,
    usageCount: 18,
    capacityPercent: 54,
    facilityBonus: "+3 Usage"
  },
  {
    id: "r-med",
    name: "Medical Bay",
    minRequiredTier: TierLevel.GOLD,
    usageCount: 7,
    capacityPercent: 38,
    facilityBonus: null as string | null
  },
  {
    id: "r-cabin",
    name: "Private Cabins",
    minRequiredTier: TierLevel.GOLD,
    usageCount: 0,
    capacityPercent: 0,
    facilityBonus: null as string | null
  },
  {
    id: "r-vip",
    name: "VIP Rec Deck",
    minRequiredTier: TierLevel.PLATINUM,
    usageCount: 3,
    capacityPercent: 90,
    facilityBonus: null as string | null
  },
  {
    id: "r-bridge",
    name: "Observation Bridge",
    minRequiredTier: TierLevel.PLATINUM,
    usageCount: 1,
    capacityPercent: 20,
    facilityBonus: null as string | null
  }
];

export const SEED_AUDIT_MESSAGES: { severity: "success" | "alert" | "admin"; message: string }[] = [
  {
    severity: "success",
    message: "User 'Afni' accessed Food Station 04. (+1 Usage)"
  },
  {
    severity: "alert",
    message: "ALERT: User 'Zoe' (SILVER) attempted VIP Rec Deck — ACCESS DENIED."
  },
  {
    severity: "admin",
    message: "ADMIN 'Everest' upgraded User 'Jack' to PLATINUM. (Tier Change)"
  }
];
