import { useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import type { TierLevelNum } from "@/types";

/**
 * Client-side tier evaluation mirrors {@link TierStrategy} on the server
 * (numeric comparison keeps UI open to new tiers without branching).
 */
export function useResourceAccess(activeTier: TierLevelNum | undefined) {
  const canAccess = useMemo(() => {
    return (required: TierLevelNum) => typeof activeTier === "number" && activeTier >= required;
  }, [activeTier]);

  const useFacility = useCallback(async (resourceId: string) => {
    return api.useResource(resourceId);
  }, []);

  return { canAccess, useFacility };
}
