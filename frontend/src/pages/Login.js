import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api, formatErr } from "@/lib/api";
import { KnightMark } from "@/components/site/Logo";

const inputCls = "w-full border-b border-input bg-transparent py-3 text-base outline-none transition-colors focus:border-gold";

function loadGoogleScript(callback) {
  if (typeof window === "undefined") return;
  if (window.google?.accounts) {
    if (callback) callback();
    return;
  }
  const existing = document.getElementById("google-gsi-client");
  if (!existing) {
    const s = document.createElement("script");
    s.id = "google-gsi-client";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      if (callback) callback();
    };
    document.head.appendChild(s);
  } else if (callback) {
    existing.addEventListener("load", callback);
  }
}

export default function Login() {
  const { user, login, register, loginWithGoogle } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(
    process.env.REACT_APP_GOOGLE_CLIENT_ID || ""
  );

  useEffect(() => {
    loadGoogleScript();
    if (!googleClientId) {
      api
        .get("/auth/google/config")
        .then(({ data }) => {
          if (data?.client_id) {
            setGoogleClientId(data.client_id);
          }
        })
        .catch(() => {});
    }
  }, [googleClientId]);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/account"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = mode === "login" ? await login(f.email, f.password) : await register(f.name, f.email, f.password);
      nav(u.role === "admin" ? "/admin" : "/account");
    } catch (err) {
      toast.error(formatErr(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!googleClientId) {
      toast.error(
        "Google Sign-In is being configured. Please add GOOGLE_CLIENT_ID to your Vercel project environment variables."
      );
      return;
    }

    if (typeof window === "undefined" || !window.google?.accounts) {
      toast.error("Google services are loading. Please try again in a moment.");
      return;
    }

    setGoogleBusy(true);

    try {
      // Modern Google OAuth2 Token Client (Popup flow)
      if (window.google.accounts.oauth2?.initTokenClient) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setGoogleBusy(false);
              if (tokenResponse.error !== "popup_closed_by_user") {
                toast.error(tokenResponse.error_description || "Google sign-in was cancelled.");
              }
              return;
            }
            if (tokenResponse?.access_token) {
              try {
                const u = await loginWithGoogle({ access_token: tokenResponse.access_token });
                toast.success("Welcome to the House.");
                nav(u.role === "admin" ? "/admin" : "/account");
              } catch (err) {
                toast.error(formatErr(err));
              } finally {
                setGoogleBusy(false);
              }
            } else {
              setGoogleBusy(false);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      }

      // Fallback: Google Identity Services ID Token flow
      if (window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (res) => {
            if (res?.credential) {
              try {
                const u = await loginWithGoogle({ credential: res.credential });
                toast.success("Welcome to the House.");
                nav(u.role === "admin" ? "/admin" : "/account");
              } catch (err) {
                toast.error(formatErr(err));
              } finally {
                setGoogleBusy(false);
              }
            } else {
              setGoogleBusy(false);
            }
          },
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setGoogleBusy(false);
          }
        });
        return;
      }

      setGoogleBusy(false);
    } catch (e) {
      setGoogleBusy(false);
      toast.error("Google sign-in error: " + (e?.message || e));
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2" data-testid="login-page">
      <div className="relative hidden overflow-hidden bg-[#4B0F2C] text-[#FFE4EE] lg:block">
        <p aria-hidden="true" className="pointer-events-none absolute left-6 top-28 select-none font-display text-[11vw] leading-[0.85] opacity-[0.14]">Side<br />Effect</p>
        <img src="/images/cut-side-effect.png" alt="" className="bottle-shadow animate-floaty absolute left-1/2 top-1/2 h-[62svh] w-auto -translate-x-1/2 -translate-y-1/2" style={{ "--tilt": "-5deg" }} />
        <p className="absolute bottom-16 left-16 max-w-md font-display text-6xl leading-[0.9]">Enter the House.</p>
      </div>
      <div className="flex items-center justify-center px-6 pb-16 pt-28">
        <div className="w-full max-w-md">
          <KnightMark className="h-12 w-12 text-gold" />
          <h1 className="mt-8 font-display text-5xl">{mode === "login" ? "Welcome back." : "Join the House."}</h1>
          <div className="mt-8 flex gap-8 border-b">
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => setMode(m)} data-testid={`auth-tab-${m}`} className={`-mb-px border-b pb-3 text-xs uppercase tracking-[0.3em] transition-colors ${mode === m ? "border-gold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {mode === "register" && (
              <input required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} data-testid="auth-name" />
            )}
            <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inputCls} data-testid="auth-email" />
            <input required type="password" minLength={6} placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={inputCls} data-testid="auth-password" />
            <button disabled={busy || googleBusy} className="btn-royal w-full disabled:opacity-60" data-testid="auth-submit">
              <span>{busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}</span>
            </button>
          </form>

          {/* Luxury Google Sign-In Option */}
          <div className="mt-8 space-y-4">
            <div className="relative flex items-center justify-center py-2">
              <div className="w-full border-t border-border/60" />
              <span className="absolute bg-background px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                or continue with
              </span>
            </div>

            <button
              type="button"
              disabled={busy || googleBusy}
              onClick={handleGoogleSignIn}
              data-testid="google-signin-btn"
              className="group relative flex w-full items-center justify-center gap-3 rounded-full border border-border/80 bg-background/80 py-3 px-5 text-sm font-semibold transition-all hover:border-gold hover:bg-gold/5 hover:shadow-md disabled:opacity-60 cursor-pointer"
            >
              <svg className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{googleBusy ? "Connecting to Google…" : "Continue with Google"}</span>
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
