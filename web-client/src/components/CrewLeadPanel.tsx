import { useMemo, useState } from "react";

import { useUserContext } from "@/context/UserContext";
import { api } from "@/lib/api";

export function CrewLeadPanel() {
  const { users, activeUser, refreshUsers } = useUserContext();
  const [message, setMessage] = useState<string | null>(null);

  const crewLeadCount = useMemo(
    () => users.filter((u) => u.role === "crew_lead").length,
    [users]
  );

  const slotsFull = crewLeadCount >= 3;
  const canManage = activeUser?.role === "crew_lead";

  const onAdd = async () => {
    if (!activeUser || !canManage || slotsFull) return;
    const candidate =
      users.find((u) => u.role === "passenger" && u.id !== activeUser.id) ??
      users.find((u) => u.role === "passenger");
    if (!candidate) return;
    setMessage(null);
    try {
      await api.promoteCrewLead({ userId: candidate.id, requestedByAdminId: activeUser.id });
      await refreshUsers();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Promotion failed");
    }
  };

  return (
    <section className="rounded-[10px] border-2 border-sky-900/50 bg-[#1a1a1a]/75 p-3 backdrop-blur-sm">
      <p className="title-font text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00f2ff]/90">
        Crew Lead Command Center
      </p>
      <p className="mt-1 text-[9px] uppercase tracking-wide text-sky-600">
        (Only crew leads can register additional leads)
      </p>
      <button
        type="button"
        disabled={!canManage || slotsFull}
        onClick={onAdd}
        className="mt-4 w-full rounded-[10px] border-2 border-[#4a4a4a] bg-[#2a2a2a]/80 px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add Crew Lead
      </button>
      <p className="mt-3 text-[10px] text-sky-500">
        {slotsFull ? (
          <span className="text-[#ff4d4d]">(3 slots are full)</span>
        ) : (
          <>
            {(3 - crewLeadCount).toString()} slot(s) remaining • {crewLeadCount}/3 leads
          </>
        )}
      </p>
      {!canManage && (
        <p className="mt-2 text-[10px] text-sky-600">Select a crew lead account to enable.</p>
      )}
      {message && <p className="mt-2 text-[10px] text-[#ff4d4d]">{message}</p>}
    </section>
  );
}
