import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ApiUser } from "@/types";

interface UserContextValue {
  users: ApiUser[];
  activeUser: ApiUser | null;
  setActiveUserId: (id: string) => void;
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: sessionUser } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.users();
      setUsers(data);
      setActiveId((prev) => {
        if (prev && data.some((u) => u.id === prev)) return prev;
        if (sessionUser && data.some((u) => u.id === sessionUser.id)) {
          return sessionUser.id;
        }
        const afni = data.find((u) => u.name === "Afni");
        return afni?.id ?? data[0]?.id ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [sessionUser]);

  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);

  const activeUser = useMemo(
    () => users.find((u) => u.id === activeId) ?? null,
    [users, activeId]
  );

  const value = useMemo<UserContextValue>(
    () => ({
      users,
      activeUser,
      setActiveUserId: setActiveId,
      loading,
      error,
      refreshUsers
    }),
    [users, activeUser, loading, error, refreshUsers]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within UserProvider");
  return ctx;
}
