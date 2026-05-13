import { useCallback, useEffect, useState } from "react";

import { MissionStatusStrip } from "@/components/MissionStatusStrip";
import { api } from "@/lib/api";
import type { ApiResource, AuditEntry } from "@/types";
import { CommandSidebar } from "@/pages/mission/CommandSidebar";
import { MissionHeader } from "@/pages/mission/MissionHeader";
import { ResourceDiscoverySection } from "@/pages/mission/ResourceDiscoverySection";
import { useUserContext } from "@/context/UserContext";

export function MissionDashboardPage() {
  const { activeUser } = useUserContext();
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const resourceReq =
        activeUser?.role === "crew_lead" ? api.resources() : api.resourcesAccessible();
      const [r, a] = await Promise.all([resourceReq, api.audit()]);
      setResources(r);
      setAudit(a);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load mission data");
    }
  }, [activeUser?.id, activeUser?.role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const tierLine = activeUser?.tierLabel ?? "SILVER";

  return (
    <div className="mission-shell">
      <div className="mission-shell__content mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <MissionHeader />

        <MissionStatusStrip />

        {loadError && (
          <p className="mt-4 rounded-lg border border-[#ff4d4d]/50 bg-black/50 px-3 py-2 text-sm text-[#ff4d4d]">
            {loadError}
          </p>
        )}

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <ResourceDiscoverySection
            resources={resources}
            userTier={activeUser?.tier}
            tierLine={tierLine}
            onAfterUse={refresh}
          />
          <CommandSidebar audit={audit} onRefresh={refresh} />
        </div>
      </div>
    </div>
  );
}
