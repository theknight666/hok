import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatErr } from "@/lib/api";
import { KnightMark } from "@/components/site/Logo";

const inputCls = "w-full border-b border-input bg-transparent py-3 text-base outline-none transition-colors focus:border-gold";

function googleLogin() {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const redirectUrl = window.location.origin + "/account";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
}

export default function Login() {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

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

  return (
    <main className="grid min-h-screen lg:grid-cols-2" data-testid="login-page">
      <div className="relative hidden overflow-hidden bg-[#0E0C0A] lg:block">
        <img src="/images/side-effect.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A] via-transparent" />
        <p className="absolute bottom-16 left-16 max-w-md font-display text-5xl font-light leading-tight text-[#EFE6D2]">Enter the House.</p>
      </div>
      <div className="flex items-center justify-center px-6 pb-16 pt-28">
        <div className="w-full max-w-md">
          <KnightMark className="h-12 w-12 text-gold" />
          <h1 className="mt-8 font-display text-5xl font-light">{mode === "login" ? "Welcome back." : "Join the House."}</h1>
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
            <button disabled={busy} className="btn-royal w-full disabled:opacity-60" data-testid="auth-submit">
              <span>{busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}</span>
            </button>
          </form>
          <div className="my-8 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <button onClick={googleLogin} className="btn-ghost-royal w-full justify-center" data-testid="google-login-btn">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </main>
  );
}
