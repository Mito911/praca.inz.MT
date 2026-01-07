import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UserRole } from "../apiClient";

type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
  token: string;
} | null;

type AuthContextValue = {
  user: AuthUser;
  isAdmin: boolean;
  login: (data: { id: number; email: string; role: UserRole; token: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LS_TOKEN = "authToken";
const LS_EMAIL = "authEmail";
const LS_ROLE = "authRole";
const LS_ID = "authId";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);

  useEffect(() => {
    const token = localStorage.getItem(LS_TOKEN);
    const email = localStorage.getItem(LS_EMAIL);
    const role = localStorage.getItem(LS_ROLE) as UserRole | null;
    const idRaw = localStorage.getItem(LS_ID);

    const id = idRaw ? Number(idRaw) : NaN;

    if (token && email && role && Number.isFinite(id)) {
      setUser({ id, email, role, token });
    }
  }, []);

  function login(data: { id: number; email: string; role: UserRole; token: string }) {
    localStorage.setItem(LS_TOKEN, data.token);
    localStorage.setItem(LS_EMAIL, data.email);
    localStorage.setItem(LS_ROLE, data.role);
    localStorage.setItem(LS_ID, String(data.id));
    setUser({ ...data });
  }

  function logout() {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_EMAIL);
    localStorage.removeItem(LS_ROLE);
    localStorage.removeItem(LS_ID);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isAdmin: user?.role === "ADMIN",
      login,
      logout,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

