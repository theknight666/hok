import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const { hash, search } = useLocation();
  const nav = useNavigate();
  const { setUser } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const params = new URLSearchParams(hash ? hash.slice(1) : search);
    const token =
      params.get("credential") ||
      params.get("id_token") ||
      params.get("access_token") ||
      params.get("session_id");

    window.history.replaceState(null, "", window.location.pathname);
    if (!token) {
      nav("/login", { replace: true });
      return;
    }
    api
      .post("/auth/google", { credential: token, session_id: token })
      .then(({ data }) => {
        setUser(data);
        try {
          localStorage.setItem("hotk_user", JSON.stringify(data));
        } catch {}
        nav(data.role === "admin" ? "/admin" : "/account", { replace: true });
      })
      .catch(() => nav("/login", { replace: true }));
  }, [hash, search, nav, setUser]);

  return <div className="min-h-screen" data-testid="auth-callback" />;
}
