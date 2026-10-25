import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { api, inr } from "@/lib/api";

function Stat({ label, value, id }) {
  return (
    <div className="border bg-card p-6">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-4 font-display text-4xl" data-testid={`stat-${id}`}>{value}</p>
    </div>
  );
}

export function Overview() {
  const qc = useQueryClient();
  const [resetting, setResetting] = useState(false);
  const { data: s } = useQuery({ queryKey: ["admin-stats"], queryFn: async () => (await api.get("/admin/stats")).data });
  const best = Array.isArray(s?.best_sellers) ? s.best_sellers : [];
  const low = Array.isArray(s?.low_stock) ? s.low_stock : [];
  const max = Math.max(1, ...best.map((b) => b.units));

  const handleResetData = async () => {
    if (!window.confirm("Clear all mock/test orders and dummy customer data? Stock will be restored to 50 bottles each.")) return;
    try {
      setResetting(true);
      await api.post("/admin/reset-demo-data");
      toast.success("Ledger reset. All dummy data cleared.");
      ["admin-stats", "admin-products", "admin-orders", "admin-customers"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    } catch (e) {
      toast.error("Failed to reset demo data");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-10" data-testid="admin-overview">
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl">Overview</p>
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50"
          title="Clear dummy development orders and test customers"
        >
          <RotateCcw className="h-3 w-3" />
          <span>{resetting ? "Resetting..." : "Clear Test Data"}</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Revenue" value={inr(s?.revenue ?? 0)} id="revenue" />
        <Stat label="Orders" value={s?.orders ?? 0} id="orders" />
        <Stat label="Pending" value={s?.pending ?? 0} id="pending" />
        <Stat label="Customers" value={s?.customers ?? 0} id="customers" />
        <Stat label="Units in stock" value={s?.units_in_stock ?? 0} id="units" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border p-6">
          <p className="font-display text-2xl">Best sellers</p>
          <div className="mt-6 space-y-5">
            {best.map((b) => (
              <div key={b.slug}>
                <div className="flex justify-between text-sm"><span>{b.name}</span><span className="text-muted-foreground">{b.units} sold</span></div>
                <div className="mt-2 h-1 bg-muted"><div className="h-1 bg-gold transition-[width] duration-700" style={{ width: `${(b.units / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="border p-6" data-testid="low-stock-panel">
          <p className="font-display text-2xl">Low-stock alerts</p>
          {!low.length && <p className="mt-6 text-sm text-muted-foreground">All fragrances are comfortably stocked.</p>}
          <ul className="mt-6 space-y-3">
            {low.map((l) => (
              <li key={l.slug} className="flex items-center gap-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-gold" strokeWidth={1.4} />
                <span className="flex-1">{l.name}</span>
                <span className={l.stock === 0 ? "text-destructive" : "text-gold"}>{l.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
