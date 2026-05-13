import { AuditFeed } from "@/components/AuditFeed";
import { CrewLeadPanel } from "@/components/CrewLeadPanel";
import type { AuditEntry } from "@/types";

type CommandSidebarProps = {
  audit: AuditEntry[];
  onRefresh: () => Promise<void>;
};

export function CommandSidebar({ audit, onRefresh }: CommandSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col gap-5 lg:sticky lg:top-6">
      <CrewLeadPanel />
      <div className="min-h-[380px] flex-1 lg:max-h-[calc(100vh-8rem)]">
        <AuditFeed entries={audit} onRefresh={onRefresh} />
      </div>
    </aside>
  );
}
