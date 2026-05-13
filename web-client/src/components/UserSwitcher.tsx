import { useAuth } from "@/context/AuthContext";
import { useUserContext } from "@/context/UserContext";

export function UserSwitcher() {
  const { logout } = useAuth();
  const { users, activeUser, setActiveUserId, loading, error } = useUserContext();

  if (error) {
    return (
      <div className="w-full max-w-[280px] rounded-xl border border-[#ff4d4d]/50 bg-[#1a1a1a]/90 p-3 text-[11px] text-[#ff4d4d]">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[280px] rounded-xl border-2 border-[#00f2ff]/40 bg-[#1a1a1a]/85 p-3 shadow-[0_0_28px_rgba(0,242,255,0.12)] backdrop-blur-sm">
      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#00f2ff]/90">
        Current User
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div
          className="pixel-avatar flex h-14 w-14 shrink-0 items-center justify-center rounded border-2 border-[#ffb800]/70 bg-gradient-to-br from-sky-900 to-black"
          aria-hidden
        >
          <span className="text-2xl leading-none">👤</span>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <label className="sr-only" htmlFor="user-switch">
            Select operator
          </label>
          <select
            id="user-switch"
            disabled={loading || users.length === 0}
            value={activeUser?.id ?? ""}
            onChange={(e) => setActiveUserId(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-[#4a4a4a] bg-black/50 px-2 py-2 text-[13px] font-semibold text-sky-100 outline-none ring-[#00f2ff]/20 focus:border-[#00f2ff]/70 focus:ring-1"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
                {u.isAdmin ? " • Admin" : ""}
                {u.role === "crew_lead" ? " • Crew Lead" : ""}
              </option>
            ))}
          </select>
          {activeUser?.email && (
            <p className="truncate text-[10px] text-sky-500">{activeUser.email}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-sky-500">Tier:</span>
            <span className="rounded border border-[#ffb800]/55 bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase text-[#ffb800]">
              {activeUser?.tierLabel ?? "—"}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => logout()}
        className="mt-3 w-full rounded-lg border border-sky-800 bg-black/40 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sky-400 hover:border-[#ff4d4d]/40 hover:text-[#ff4d4d]"
      >
        Sign out
      </button>
    </div>
  );
}
