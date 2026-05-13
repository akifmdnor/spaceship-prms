import { Dashboard } from "@/components/Dashboard";
import { LoginPage } from "@/components/LoginPage";
import { useAuth } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";

export function AppShell() {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f12] text-sky-400">
        <p className="font-mono text-sm">Establishing link…</p>
      </div>
    );
  }

  if (!token || !user) {
    return <LoginPage />;
  }

  return (
    <UserProvider>
      <Dashboard />
    </UserProvider>
  );
}
