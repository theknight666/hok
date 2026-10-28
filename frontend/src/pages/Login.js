import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatErr } from "@/lib/api";
import { KnightMark } from "@/components/site/Logo";

const inputCls = "w-full border-b border-input bg-transparent py-3 text-base outline-none transition-colors focus:border-gold";


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
            <button disabled={busy} className="btn-royal w-full disabled:opacity-60" data-testid="auth-submit">
              <span>{busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}</span>
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}
