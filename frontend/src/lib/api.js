import axios from "axios";

const rawBase = process.env.REACT_APP_BACKEND_URL;
const backendUrl = rawBase && rawBase !== "undefined" ? rawBase.replace(/\/+$/, "") : "";
export const api = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("hotk_user") : null;
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.token && !config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      }
    }
  } catch (e) {}
  return config;
});

const NO_RETRY = ["/auth/refresh", "/auth/login", "/auth/register", "/auth/google/session"];
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err.config || {};
    if (err.response?.status === 401 && !cfg._retry && !NO_RETRY.some((u) => cfg.url?.includes(u))) {
      cfg._retry = true;
      try {
        refreshing = refreshing || api.post("/auth/refresh");
        await refreshing;
        refreshing = null;
        return api(cfg);
      } catch {
        refreshing = null;
      }
    }
    return Promise.reject(err);
  }
);

export function formatErr(err) {
  const d = err?.response?.data?.detail;
  if (d == null) return err?.message || "Something went wrong. Please try again.";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  return d?.msg || String(d);
}

export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
export const FREE_SHIPPING = 15000;
export const SHIPPING_FEE = 500;
