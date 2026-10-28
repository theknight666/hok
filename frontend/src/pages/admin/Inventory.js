import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { api, formatErr, inr } from "@/lib/api";
import { ProductDialog } from "./ProductDialog";

function Row({ p, onEdit, refresh }) {
  const [amount, setAmount] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const adjust = async (delta) => {
    try {
      await api.post(`/admin/products/${p.slug}/stock`, { delta });
      toast.success(`${p.name}: stock ${delta > 0 ? "+" : ""}${delta}`);
      refresh();
    } catch (e) {
      toast.error(formatErr(e));
    }
  };
  const toggle = async (active) => {
    await api.patch(`/admin/products/${p.slug}`, { active }).catch((e) => toast.error(formatErr(e)));
    refresh();
  };
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/products/${p.slug}`);
      toast.success(`"${p.name}" deleted permanently`);
      refresh();
    } catch (e) {
      toast.error(formatErr(e));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const low = p.stock <= p.low_stock_threshold;
  return (
    <tr className="border-b align-middle" data-testid={`inventory-row-${p.slug}`}>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-4">
          <img src={p.image} alt="" className="h-14 w-11 rounded-lg bg-muted object-contain" data-testid={`inventory-image-${p.slug}`} />
          <div>
            <p className="font-display text-xl leading-tight">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.concentration} · {p.volume}</p>
          </div>
        </div>
      </td>
      <td className="pr-4">{inr(p.price)}</td>
      <td className="pr-4">
        <span className={low ? "text-gold" : ""} data-testid={`inventory-stock-${p.slug}`}>{p.stock}</span>
        <span className="ml-2 text-xs text-muted-foreground">/ alert ≤ {p.low_stock_threshold}</span>
      </td>
      <td className="pr-4">
        <div className="flex items-center gap-2">
          <button onClick={() => adjust(-amount)} className="grid h-8 w-8 place-items-center border hover:border-gold" data-testid={`stock-remove-${p.slug}`} aria-label="Remove stock"><Minus className="h-3.5 w-3.5" /></button>
          <input type="number" min={1} value={amount} onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))} className="h-8 w-16 border bg-transparent text-center text-sm" data-testid={`stock-amount-${p.slug}`} />
          <button onClick={() => adjust(amount)} className="grid h-8 w-8 place-items-center border hover:border-gold" data-testid={`stock-add-${p.slug}`} aria-label="Add stock"><Plus className="h-3.5 w-3.5" /></button>
        </div>
      </td>
      <td className="pr-4"><Switch checked={p.active} onCheckedChange={toggle} data-testid={`active-toggle-${p.slug}`} /></td>
      <td className="text-right">
        {confirmDelete ? (
          <div className="inline-flex items-center gap-2">
            <span className="text-[11px] font-semibold text-destructive">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground hover:opacity-90"
              data-testid={`confirm-delete-${p.slug}`}
            >
              {deleting ? "Deleting…" : "Yes"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              No
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-3">
            <button onClick={() => onEdit(p)} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-gold hover:opacity-70" data-testid={`edit-product-${p.slug}`}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1 text-muted-foreground transition-colors hover:text-destructive"
              data-testid={`delete-product-${p.slug}`}
              title="Delete fragrance"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}


export function Inventory() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-products"], queryFn: async () => (await api.get("/admin/products")).data });
  const { data: log } = useQuery({ queryKey: ["inv-log"], queryFn: async () => (await api.get("/admin/inventory-log")).data });
  const [editing, setEditing] = useState(null);
  const products = Array.isArray(data) ? data : [];
  const refresh = () => ["admin-products", "inv-log", "admin-stats", "products"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

  return (
    <div data-testid="admin-inventory">
      <div className="mb-6 flex items-center justify-between">
        <p className="font-display text-2xl">Fragrances</p>
        <button onClick={() => setEditing({})} className="btn-royal !px-5 !py-3" data-testid="new-product-btn"><span>New fragrance</span></button>
      </div>
      <div className="overflow-x-auto" data-lenis-prevent>
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b text-left text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">
              <th className="pb-3">Fragrance</th><th className="pb-3">Price</th><th className="pb-3">Stock</th><th className="pb-3">Adjust stock</th><th className="pb-3">Live</th><th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => <Row key={p.slug} p={p} onEdit={setEditing} refresh={refresh} />)}
          </tbody>
        </table>
      </div>
      <p className="mt-14 font-display text-2xl">Recent stock movements</p>
      <ul className="mt-4 divide-y border-y text-sm" data-testid="inventory-log">
        {(Array.isArray(log) ? log : []).slice(0, 12).map((l, i) => (
          <li key={i} className="flex flex-wrap justify-between gap-2 py-3">
            <span>{l.slug}</span>
            <span className={l.delta > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}>{l.delta > 0 ? "+" : ""}{l.delta}</span>
            <span className="text-muted-foreground">→ {l.stock_after}</span>
            <span className="text-muted-foreground">{new Date(l.at).toLocaleString("en-IN")}</span>
          </li>
        ))}
        {!(Array.isArray(log) && log.length) && <li className="py-3 text-muted-foreground">No movements yet.</li>}
      </ul>
      {editing && <ProductDialog product={editing} onClose={() => setEditing(null)} onSaved={refresh} />}
    </div>
  );
}
