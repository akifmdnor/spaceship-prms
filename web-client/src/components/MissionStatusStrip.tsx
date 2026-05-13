export function MissionStatusStrip() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-[#00f2ff]/15 pb-5">
      <span className="inline-flex items-center rounded-lg border-2 border-[#ffb800] bg-black/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#ffb800] shadow-[0_0_12px_rgba(255,184,0,0.15)]">
        Mission Status: EN ROUTE (MARS)
      </span>
      <span className="inline-flex items-center rounded-lg border border-[#00f2ff]/70 bg-black/25 px-3 py-1.5 text-[11px] tabular-nums text-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.12)]">
        O₂: 98%
      </span>
      <span className="inline-flex items-center rounded-lg border border-[#ffb800]/60 bg-black/25 px-3 py-1.5 text-[11px] tabular-nums text-[#ffb800]">
        RATIONS: 1240
      </span>
      <span className="inline-flex items-center rounded-lg border border-[#00f2ff]/70 bg-black/25 px-3 py-1.5 text-[11px] tabular-nums text-[#00f2ff]">
        MED: 75%
      </span>
    </div>
  );
}
