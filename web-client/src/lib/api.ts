import type { ApiResource, ApiUser, AuditEntry } from "@/types";

const base = import.meta.env.VITE_API_BASE ?? "";
const TOKEN_KEY = "prms_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function buildHeaders(): HeadersInit {
  const h: Record<string, string> = {};
  const t = getStoredToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg =
      typeof errBody === "object" && errBody && "error" in errBody
        ? String((errBody as { error: string }).error)
        : res.statusText;
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async login(email: string, password: string): Promise<{ token: string; user: ApiUser }> {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return handle(res);
  },

  async me(): Promise<ApiUser> {
    return handle(
      await fetch(`${base}/api/auth/me`, {
        headers: buildHeaders()
      })
    );
  },

  async demoAccounts(): Promise<{
    accounts: { email: string; password: string; role: string }[];
  }> {
    return handle(await fetch(`${base}/api/meta/demo-accounts`));
  },

  async users(): Promise<ApiUser[]> {
    return handle(
      await fetch(`${base}/api/users`, {
        headers: buildHeaders()
      })
    );
  },
  async resources(): Promise<ApiResource[]> {
    return handle(
      await fetch(`${base}/api/resources`, {
        headers: buildHeaders()
      })
    );
  },
  async audit(q?: string): Promise<AuditEntry[]> {
    const url = q ? `${base}/api/audit?q=${encodeURIComponent(q)}` : `${base}/api/audit`;
    return handle(await fetch(url, { headers: buildHeaders() }));
  },
  async useResource(resourceId: string) {
    return handle(
      await fetch(`${base}/api/resources/${resourceId}/use`, {
        method: "POST",
        headers: buildHeaders()
      })
    );
  },
  async promoteCrewLead(payload: { userId: string; requestedByAdminId: string }) {
    return handle(
      await fetch(`${base}/api/admin/crew-leads`, {
        method: "POST",
        headers: { ...buildHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );
  }
};
