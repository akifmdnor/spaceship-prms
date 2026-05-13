import { type FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const FALLBACK_HINT: { email: string; password: string; role: string }[] = [
  { email: "afni@prms.local", password: "silver-demo", role: "Silver passenger" },
  { email: "zoe@prms.local", password: "silver-demo", role: "Silver passenger" },
  { email: "everest@prms.local", password: "admin-demo", role: "Crew lead — roster, tier tools (3 lead slots)" },
  { email: "jack@prms.local", password: "gold-demo", role: "Gold passenger" },
  { email: "rhea@prms.local", password: "crew-demo", role: "Crew lead" },
  { email: "morgan@prms.local", password: "crew-demo", role: "Crew lead" },
  { email: "kim@prms.local", password: "crew-demo", role: "Crew lead (3/3 slots)" }
];

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("afni@prms.local");
  const [password, setPassword] = useState("silver-demo");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hint, setHint] = useState(FALLBACK_HINT);

  useEffect(() => {
    void api
      .demoAccounts()
      .then((d) => setHint(d.accounts))
      .catch(() => {
        /* use FALLBACK_HINT */
      });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f12] px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <p className="title-font text-[10px] font-semibold uppercase tracking-[0.35em] text-[#00f2ff]/90">
            SPACESHIP X26 // PRMS
          </p>
          <h1 className="title-font mt-2 text-2xl font-bold text-sky-50">Mission Control Login</h1>
          <p className="mt-2 text-xs text-sky-500">
            Authenticate with a seeded demo account (PostgreSQL + bcrypt + JWT).
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-[10px] border-2 border-[#00f2ff]/35 bg-[#1a1a1a]/90 p-6 shadow-[0_0_28px_rgba(0,242,255,0.1)]"
        >
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-sky-400">
              Email
            </label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#4a4a4a] bg-black/50 px-3 py-2 text-sm text-sky-100 outline-none focus:border-[#00f2ff]/60"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-sky-400">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#4a4a4a] bg-black/50 px-3 py-2 text-sm text-sky-100 outline-none focus:border-[#00f2ff]/60"
            />
          </div>
          {error && (
            <p className="rounded border border-[#ff4d4d]/40 bg-black/40 px-2 py-2 text-xs text-[#ff4d4d]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="title-font w-full rounded-lg border-2 border-[#00f2ff] bg-[#00f2ff]/10 py-2.5 text-sm font-bold uppercase tracking-[0.2em] text-[#00f2ff] hover:bg-[#00f2ff]/15 disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Enter Mission Control"}
          </button>
        </form>

        <section className="rounded-[10px] border border-sky-900/60 bg-[#1a1a1a]/80 p-4">
          <h2 className="title-font text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffb800]">
            Demo accounts (same as DB seed)
          </h2>
          <p className="mt-1 text-[10px] text-sky-500">
            Use any row below — passwords are for local development only.
          </p>
          <div className="mt-3 max-h-64 overflow-auto text-[11px]">
            <table className="w-full border-collapse font-mono text-left">
              <thead>
                <tr className="border-b border-sky-900 text-[10px] uppercase text-sky-500">
                  <th className="py-1 pr-2">Email</th>
                  <th className="py-1 pr-2">Password</th>
                  <th className="py-1">Role / notes</th>
                </tr>
              </thead>
              <tbody>
                {hint.map((row) => (
                  <tr key={row.email} className="border-b border-sky-950/50 text-sky-200">
                    <td className="py-1.5 pr-2 text-[#00f2ff]">{row.email}</td>
                    <td className="py-1.5 pr-2 text-[#ffb800]">{row.password}</td>
                    <td className="py-1.5 text-sky-400">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
