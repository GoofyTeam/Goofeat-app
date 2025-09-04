import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '@/services/api';
import { getTokenStorage, setTokenStorage, clearTokenStorage, ensureStorageHydrated } from '@/services/storage';
import { User, isTokenExpired, login as apiLogin, register as apiRegister, me as apiMe, logout as apiLogout } from '@/services/auth';

type AuthContextType = {
  initialized: boolean;
  user?: User;
  token?: string;
  login: (dto: { email: string; password: string }) => Promise<void>;
  register: (dto: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  setAccessToken: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);

  const loadMe = useCallback(async () => {
    const u = await apiMe();
    setUser(u);
  }, []);

  const doLogin = useCallback(async (dto: { email: string; password: string }) => {
    const res = await apiLogin(dto);
    setTokenStorage(res.access_token);
    setToken(res.access_token);
    await loadMe();
  }, [loadMe]);

  const doRegister = useCallback(async (dto: { email: string; password: string; firstName?: string; lastName?: string }) => {
    await apiRegister(dto);
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    clearTokenStorage();
    setToken(undefined);
    setUser(undefined);
  }, []);

  const refreshMe = useCallback(async () => {
    await loadMe();
  }, [loadMe]);

  const setAccessToken = useCallback(async (t: string) => {
    setTokenStorage(t);
    setToken(t);
    await loadMe().catch(() => {
    });
  }, [loadMe]);

  // 401 handling from api client
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(undefined);
  }, [logout]);

  // Initialize from storage (await hydrate on native)
  useEffect(() => {
    (async () => {
      await ensureStorageHydrated();
      const stored = getTokenStorage();
      if (stored && !isTokenExpired(stored)) {
        setToken(stored);
        try {
          await loadMe();
        } catch {
          clearTokenStorage();
          setToken(undefined);
          setUser(undefined);
        }
      } else if (stored && isTokenExpired(stored)) {
        clearTokenStorage();
      }
      setInitialized(true);
    })();
  }, [loadMe]);

  const value = useMemo<AuthContextType>(() => ({
    initialized,
    user,
    token,
    login: doLogin,
    register: doRegister,
    logout,
    refreshMe,
    setAccessToken,
  }), [initialized, user, token, doLogin, doRegister, logout, refreshMe, setAccessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
