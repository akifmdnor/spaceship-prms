import { useMemo, useState } from "react";

import type { AuditEntry } from "@/types";

export interface AuditFeedProps {
  entries: AuditEntry[];
  onRefresh: () => void;
}

const tone: Record<AuditEntry["severity"], string> = {
  success: "text-emerald-400",
  alert: "text-[#ff4d4d]",
  admin: "text-[#00f2ff]"
};

function formatBracketTime(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  return `[${hh}:${mm}:${ss}]`;
}

export function AuditFeed({ entries, onRefresh }: AuditFeedProps) {
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((e) => e.message.toLowerCase().includes(query));
  }, [entries, q]);

  return (
    <section className="flex h-full min-h-[320px] flex-col rounded-[10px] border-2 border-sky-900/40 bg-[#1a1a1a]/75 p-3 shadow-[inset_0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
      <header className="border-b border-[#00f2ff]/20 pb-2">
        <h2 className="title-font text-[11px] font-semibold uppercase tracking-[0.25em] text-[#00f2ff]">
          Live Audit Feed
        </h2>
        <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-sky-500">
          Mission log // Real-time events
        </p>
      </header>

      <div className="mt-3 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events…"
          className="font-mono w-full rounded-lg border border-[#4a4a4a] bg-black/45 px-2 py-1.5 text-[11px] text-sky-100 outline-none focus:border-[#00f2ff]/50"
        />
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#4a4a4a] bg-black/40 text-[#00f2ff] hover:border-[#00f2ff]/50"
          aria-label="Refresh audit log"
          title="Refresh"
        >
          ↻
        </button>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#4a4a4a] bg-black/40 text-sky-400 hover:border-[#00f2ff]/50"
          aria-label="Filter (search)"
          title="Filter"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
        </button>
      </div>

      <ul className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 font-mono text-[11px] leading-relaxed">
        {visible.map((e) => (
          <li key={e.id} className="rounded-lg border border-sky-950/50 bg-black/30 px-2 py-2">
            <span className="text-[10px] text-sky-600">{formatBracketTime(e.ts)}</span>
            <p className={`mt-0.5 pl-0 ${tone[e.severity]}`}>{e.message}</p>
          </li>
        ))}
        {visible.length === 0 && <li className="text-[11px] text-sky-600">No matching events.</li>}
      </ul>
    </section>
  );
}
