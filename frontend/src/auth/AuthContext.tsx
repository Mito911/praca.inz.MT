// src/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { UserRole } from "../apiClient";

type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
  token: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (u: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LS_TOKEN = "authToken";
const LS_EMAIL = "authEmail";
const LS_ROLE = "authRole";
const LS_ID = "authId";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(LS_TOKEN);
    const email = localStorage.getItem(LS_EMAIL);
    const role = localStorage.getItem(LS_ROLE) as UserRole | null;
    const idStr = localStorage.getItem(LS_ID);

    if (token && email && role && idStr) {
      const id = Number(idStr);
      if (!Number.isNaN(id)) setUser({ id, email, role, token });
    }
  }, []);

  function login(u: AuthUser) {
    localStorage.setItem(LS_TOKEN, u.token);
    localStorage.setItem(LS_EMAIL, u.email);
    localStorage.setItem(LS_ROLE, u.role);
    localStorage.setItem(LS_ID, String(u.id));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_EMAIL);
    localStorage.removeItem(LS_ROLE);
    localStorage.removeItem(LS_ID);
    setUser(null);
  }

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}


