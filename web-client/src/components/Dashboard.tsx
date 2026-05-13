import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { ApiResource, AuditEntry } from "@/types";
import { AuditFeed } from "@/components/AuditFeed";
import { CrewLeadPanel } from "@/components/CrewLeadPanel";
import { MissionStatusStrip } from "@/components/MissionStatusStrip";
import { ResourceGrid } from "@/components/ResourceGrid";
import { UserSwitcher } from "@/components/UserSwitcher";
import { useUserContext } from "@/context/UserContext";

export function Dashboard() {
  const { activeUser } = useUserContext();
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const [r, a] = await Promise.all([api.resources(), api.audit()]);
      setResources(r);
      setAudit(a);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load mission data");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const tierLine = activeUser?.tierLabel ?? "SILVER";

  return (
    <div className="mission-shell">
      <div className="mission-shell__content mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="title-font text-[11px] font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
              SPACESHIP X26 // MISSION CONTROL // PRMS
            </p>
          </div>
          <UserSwitcher />
        </header>

        <MissionStatusStrip />

        {loadError && (
          <p className="mt-4 rounded-lg border border-[#ff4d4d]/50 bg-black/50 px-3 py-2 text-sm text-[#ff4d4d]">
            {loadError}
          </p>
        )}

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="mb-4">
              <h2 className="title-font text-[13px] font-semibold uppercase tracking-[0.2em] text-[#00f2ff]">
                Resource Discovery Grid
              </h2>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-500">
                Available resources ({tierLine} tier)
              </p>
            </div>
            <ResourceGrid
              resources={resources}
              userTier={activeUser?.tier}
              onAfterUse={refresh}
            />
          </section>

          <aside className="flex min-h-0 flex-col gap-5 lg:sticky lg:top-6">
            <CrewLeadPanel />
            <div className="min-h-[380px] flex-1 lg:max-h-[calc(100vh-8rem)]">
              <AuditFeed entries={audit} onRefresh={refresh} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
