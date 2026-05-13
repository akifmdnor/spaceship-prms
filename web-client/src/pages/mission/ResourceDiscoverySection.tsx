import { ResourceGrid } from "@/components/ResourceGrid";
import type { ApiResource, TierLevelNum } from "@/types";

type ResourceDiscoverySectionProps = {
  resources: ApiResource[];
  userTier: TierLevelNum | undefined;
  tierLine: string;
  onAfterUse: () => Promise<void>;
};

export function ResourceDiscoverySection({
  resources,
  userTier,
  tierLine,
  onAfterUse
}: ResourceDiscoverySectionProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="title-font text-[13px] font-semibold uppercase tracking-[0.2em] text-[#00f2ff]">
          Resource Discovery Grid
        </h2>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-500">
          Available resources ({tierLine} tier)
        </p>
      </div>
      <ResourceGrid resources={resources} userTier={userTier} onAfterUse={onAfterUse} />
    </section>
  );
}
