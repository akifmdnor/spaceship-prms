import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppShell } from "@/components/AppShell";
import { AuthProvider } from "@/context/AuthContext";

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ErrorBoundary>
  );
}
