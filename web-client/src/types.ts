export type TierLevelNum = 0 | 1 | 2;

export interface ApiUser {
  id: string;
  email?: string | null;
  name: string;
  tier: TierLevelNum;
  tierLabel: string;
  isAdmin: boolean;
  role: "passenger" | "crew_lead";
}

export interface ApiResource {
  id: string;
  name: string;
  minRequiredTier: TierLevelNum;
  minRequiredLabel: string;
  usageCount: number;
  capacityPercent: number;
  facilityBonus?: string;
}

export interface AuditEntry {
  id: string;
  ts: string;
  severity: "success" | "alert" | "admin";
  message: string;
}
