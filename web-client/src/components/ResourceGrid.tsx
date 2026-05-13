import { useResourceAccess } from "@/hooks/useResourceAccess";
import type { ApiResource, TierLevelNum } from "@/types";

const TIER_ORDER: Record<string, TierLevelNum> = {
  SILVER: 0,
  GOLD: 1,
  PLATINUM: 2
};

function requiredTierLabel(min: TierLevelNum): string {
  const entry = Object.entries(TIER_ORDER).find(([, v]) => v === min);
  return entry?.[0] ?? "UNKNOWN";
}

function resourceGlyph(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("food")) return "🍳";
  if (n.includes("sleep") || n.includes("pod")) return "🛏";
  if (n.includes("med")) return "⚕";
  if (n.includes("cabin")) return "🛋";
  if (n.includes("vip") || n.includes("rec")) return "🎮";
  if (n.includes("bridge") || n.includes("obs")) return "🔭";
  return "◆";
}

export interface ResourceGridProps {
  resources: ApiResource[];
  userTier: TierLevelNum | undefined;
  onAfterUse?: () => void;
}

export function ResourceGrid({ resources, userTier, onAfterUse }: ResourceGridProps) {
  const { canAccess, useFacility } = useResourceAccess(userTier);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
      {resources.map((r) => {
        const allowed = canAccess(r.minRequiredTier);
        const locked = !allowed;
        const req = requiredTierLabel(r.minRequiredTier);
        return (
          <article
            key={r.id}
            className={[
              "relative overflow-hidden rounded-[10px] border-2 p-4 transition",
              locked
                ? "border-[#4a4a4a] bg-[#1a1a1a]/50 grayscale brightness-[0.55]"
                : "border-[#00f2ff] bg-[#1a1a1a]/60 shadow-[0_0_20px_rgba(0,242,255,0.18)]"
            ].join(" ")}
          >
            {r.facilityBonus && !locked && (
              <span className="absolute right-3 top-3 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-[#00f2ff]">
                {r.facilityBonus}
              </span>
            )}

            <div className="flex gap-3">
              <div
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-xl",
                  locked ? "border-[#4a4a4a] bg-black/40" : "border-[#00f2ff]/40 bg-black/35"
                ].join(" ")}
                aria-hidden
              >
                {resourceGlyph(r.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="title-font text-sm font-semibold tracking-wide text-sky-50">
                  {r.name}
                </h3>
                <p className="mt-1 text-[11px] text-sky-400/90">Usage • {r.usageCount}</p>
              </div>
              {locked && (
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="text-xl text-[#ff4d4d]" aria-hidden>
                    🔒
                  </span>
                  <span className="max-w-[10rem] text-[8px] font-extrabold uppercase leading-snug text-[#ff4d4d]">
                    Restricted: {req} tier required
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded bg-black/60">
              <div
                className={[
                  "h-full rounded",
                  locked ? "bg-[#4a4a4a]" : "bg-gradient-to-r from-[#00f2ff] to-[#ffb800]"
                ].join(" ")}
                style={{
                  width: `${Math.min(100, Math.max(locked ? 22 : 6, r.capacityPercent))}%`
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-sky-500/90">
                Min clearance: {r.minRequiredLabel}
              </span>
              {!locked && (
                <button
                  type="button"
                  className="rounded-lg border-2 border-[#00f2ff] bg-[#00f2ff]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#00f2ff] shadow-[0_0_14px_rgba(0,242,255,0.2)] hover:bg-[#00f2ff]/18"
                  onClick={async () => {
                    try {
                      await useFacility(r.id);
                      onAfterUse?.();
                    } catch (e) {
                      window.alert(e instanceof Error ? e.message : "Unable to use resource");
                    }
                  }}
                >
                  Use
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
