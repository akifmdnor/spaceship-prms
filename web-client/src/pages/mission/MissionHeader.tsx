import { UserSwitcher } from "@/components/UserSwitcher";

export function MissionHeader() {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl">
        <p className="title-font text-[11px] font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
          SPACESHIP X26 // MISSION CONTROL // PRMS
        </p>
      </div>
      <UserSwitcher />
    </header>
  );
}
