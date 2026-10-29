import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthCtx = createContext(null);
const STORAGE_KEY = "hotk_user";

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      const currentStored = getStoredUser();
      const finalUser = currentStored?.token && !data.token ? { ...data, token: currentStored.token } : data;
      setUser(finalUser);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalUser));
      } catch {}
    } catch (err) {
      if (err?.response?.status === 401) {
        setUser(false);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      } else {
        const stored = getStoredUser();
        if (stored) {
          setUser(stored);
        } else {
          setUser(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    return data;
  };
  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    setUser(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    return data;
  };
  const loginWithGoogle = async (credentialOrToken) => {
    const payload =
      typeof credentialOrToken === "string"
        ? { credential: credentialOrToken }
        : credentialOrToken;
    const { data } = await api.post("/auth/google", payload);
    setUser(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    return data;
  };
  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setUser(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return <AuthCtx.Provider value={{ user, setUser, login, register, logout, checkAuth, loginWithGoogle }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
