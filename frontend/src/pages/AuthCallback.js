import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const { hash } = useLocation();
  const nav = useNavigate();
  const { setUser } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const sid = new URLSearchParams(hash.slice(1)).get("session_id");
    window.history.replaceState(null, "", window.location.pathname);
    api
      .post("/auth/google/session", { session_id: sid })
      .then(({ data }) => {
        setUser(data);
        nav(data.role === "admin" ? "/admin" : "/account", { replace: true });
      })
      .catch(() => nav("/login", { replace: true }));
  }, [hash, nav, setUser]);

  return <div className="min-h-screen" data-testid="auth-callback" />;
}
