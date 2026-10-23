import { Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, inr } from "@/lib/api";

export const STATUS_STYLE = {
  pending: "border-amber-600/40 text-amber-700 dark:text-amber-400",
  processing: "border-sky-600/40 text-sky-700 dark:text-sky-400",
  dispatched: "border-violet-600/40 text-violet-700 dark:text-violet-300",
  delivered: "border-emerald-600/40 text-emerald-700 dark:text-emerald-400",
  cancelled: "border-red-600/40 text-red-700 dark:text-red-400",
};

export const StatusPill = ({ s }) => (
  <span className={`inline-block border px-3 py-1 text-[0.62rem] uppercase tracking-[0.25em] ${STATUS_STYLE[s] || ""}`}>{s}</span>
);

export default function Account() {
  const { user, logout } = useAuth();
  const { data } = useQuery({ queryKey: ["my-orders"], queryFn: async () => (await api.get("/orders/mine")).data, enabled: !!user });
  if (user === null) return <div className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  const orders = Array.isArray(data) ? data : [];

  return (
    <main className="mx-auto min-h-screen max-w-[1200px] px-5 pb-24 pt-[130px] sm:px-10" data-testid="account-page">
      <div className="flex flex-col justify-between gap-6 border-b pb-10 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl" data-testid="account-name">{user.name}</h1>
          <p className="mt-2 text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-4">
          {user.role === "admin" && <Link to="/admin" className="btn-royal" data-testid="account-admin-link"><span>Admin</span></Link>}
          <button onClick={logout} className="btn-ghost-royal" data-testid="logout-btn"><LogOut className="h-4 w-4" strokeWidth={1.3} /> Sign out</button>
        </div>
      </div>
      <h2 className="mt-14 font-display text-3xl">Order history</h2>
      {!orders.length && (
        <div className="mt-8">
          <p className="text-muted-foreground">No orders yet.</p>
          <Link to="/#collection" className="btn-ghost-royal mt-6">Explore the collection</Link>
        </div>
      )}
      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <div key={o.order_id} className="border p-6" data-testid={`my-order-${o.order_id}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-2xl">{o.order_id}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
              </div>
              <StatusPill s={o.status} />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{o.payment_status === "paid" ? "Paid" : "Payment pending"}</span>
              <p className="font-display text-2xl">{inr(o.total)}</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{o.items.map((i) => `${i.name} × ${i.qty}`).join(" · ")}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
