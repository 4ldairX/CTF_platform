"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { auth, clearTokens, getToken, setTokens } from "@/lib/api";
import type { UserOut, TokenResponse, Role } from "@/lib/types";

// ---------------------------------------------------------------------------
// Role-based redirect
// ---------------------------------------------------------------------------

export function redirectByRole(
  role: Role,
  router: ReturnType<typeof useRouter>,
): void {
  if (role === "admin") {
    router.push("/admin");
  } else if (role === "moderator") {
    // Moderator's domain is events management only
    router.push("/admin/events");
  } else if (role === "instructor") {
    router.push("/academy");
  } else {
    // competitor (default)
    router.push("/arena");
  }
}

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

type AuthContextType = {
  user: UserOut | null;
  isLoading: boolean;
  loadUser: () => Promise<UserOut | null>;
  login: (tokens: TokenResponse) => Promise<UserOut | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (): Promise<UserOut | null> => {
    const token = getToken("cq_access");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }
    try {
      const me = await auth.me();
      setUser(me);
      setIsLoading(false);
      return me;
    } catch {
      clearTokens();
      setUser(null);
      setIsLoading(false);
      return null;
    }
  }, []);

  const login = useCallback(
    async (tokens: TokenResponse): Promise<UserOut | null> => {
      setTokens(tokens.access_token, tokens.refresh_token);
      return loadUser();
    },
    [loadUser],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  // On mount: attempt to restore session from localStorage
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, loadUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
