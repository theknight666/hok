import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { api, formatErr, inr } from "@/lib/api";
import { ProductDialog } from "./ProductDialog";
import { defaultCutoutOf } from "@/lib/visual";

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
    <tr className="border-b border-border/40 hover:bg-muted/15 transition-colors align-middle" data-testid={`inventory-row-${p.slug}`}>
      <td className="py-4 pl-4 pr-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={p.image}
            alt=""
            onError={(e) => {
              if (p.image && (p.image.includes("/images/cut-") || p.image.includes("/images/blonde-amber.jpg") || p.image.includes("/images/layton.jpg") || p.image.includes("/images/angels-share.jpg") || p.image.includes("/images/side-effect.jpg"))) {
                const fallback = defaultCutoutOf(p.slug);
                if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
              }
            }}
            className="h-14 w-11 rounded-lg bg-muted object-contain shrink-0"
            data-testid={`inventory-image-${p.slug}`}
          />
          <div className="min-w-0 max-w-[260px]">
            <p className="font-display text-xl leading-tight truncate" title={p.name}>{p.name}</p>
            <p className="text-xs text-muted-foreground truncate">{p.concentration} · {p.volume}</p>
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
      <td className="pr-4 text-right">
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
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmClearLog, setConfirmClearLog] = useState(false);
  const [clearingLog, setClearingLog] = useState(false);
  const scrollRef = useRef(null);

  const products = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const refresh = () => ["admin-products", "inv-log", "admin-stats", "products"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const slug = (p.slug || "").toLowerCase();
      const family = (p.olfactory_family || "").toLowerCase();
      const conc = (p.concentration || "").toLowerCase();
      const allNotes = [
        ...(p.notes?.top || []),
        ...(p.notes?.heart || []),
        ...(p.notes?.base || []),
        ...(p.major_notes || []),
      ].join(" ").toLowerCase();
      return (
        name.includes(q) ||
        slug.includes(q) ||
        family.includes(q) ||
        conc.includes(q) ||
        allNotes.includes(q)
      );
    });
  }, [products, searchQuery]);

  const handleClearLog = async () => {
    setClearingLog(true);
    try {
      await api.delete("/admin/inventory-log");
      toast.success("Stock movements history cleared completely");
      qc.invalidateQueries({ queryKey: ["inv-log"] });
      setConfirmClearLog(false);
    } catch (e) {
      toast.error(formatErr(e));
    } finally {
      setClearingLog(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current?._lenis) {
      delete scrollRef.current._lenis;
    }
  }, [filteredProducts.length]);

  return (
    <div data-testid="admin-inventory">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-display text-2xl">Fragrances</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {searchQuery
              ? `${filteredProducts.length} of ${products.length} creations matching "${searchQuery}"`
              : `${products.length} ${products.length === 1 ? "creation" : "creations"} in catalogue`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Fragrances Search Bar */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fragrances, notes…"
              className="w-full h-10 rounded-full border border-border/80 bg-card/60 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-gold focus:bg-card focus:outline-none focus:ring-1 focus:ring-gold/30"
              data-testid="fragrance-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <button onClick={() => setEditing({})} className="btn-royal !px-5 !py-2.5 shrink-0" data-testid="new-product-btn">
            <span>New fragrance</span>
          </button>
        </div>
      </div>

      {/* Fragrances Dedicated Scroll Container with Native Luxury Scrollbar */}
      <div className="relative rounded-2xl border border-border/70 bg-card/40 shadow-sm overflow-hidden">
        <div
          ref={scrollRef}
          className="fragrance-table-scroll max-h-[350px] overflow-y-scroll overflow-x-auto"
          tabIndex={0}
          aria-label="Fragrances catalogue"
        >
          <table className="w-full min-w-[860px] text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-md shadow-[0_1px_0_0_hsl(var(--border)/0.8)]">
              <tr className="text-left text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">
                <th className="py-3.5 pl-4 pr-4">Fragrance</th>
                <th className="py-3.5 pr-4">Price</th>
                <th className="py-3.5 pr-4">Stock</th>
                <th className="py-3.5 pr-4">Adjust stock</th>
                <th className="py-3.5 pr-4">Live</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredProducts.map((p) => <Row key={p.slug} p={p} onEdit={setEditing} refresh={refresh} />)}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <p className="text-sm">No fragrances found matching "{searchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs text-gold underline underline-offset-4 hover:opacity-80 cursor-pointer"
                    >
                      Clear search
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-14 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl">Recent stock movements</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit trail of manual adjustments and order fulfillments
          </p>
        </div>

        {Array.isArray(log) && log.length > 0 && (
          confirmClearLog ? (
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-semibold text-destructive">Clear all history?</span>
              <button
                type="button"
                onClick={handleClearLog}
                disabled={clearingLog}
                className="rounded-full bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-60 cursor-pointer transition-opacity"
                data-testid="confirm-clear-stock-log"
              >
                {clearingLog ? "Clearing…" : "Yes, clear completely"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClearLog(false)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClearLog(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-destructive/60 hover:text-destructive hover:bg-destructive/5 cursor-pointer"
              data-testid="clear-stock-movements-btn"
              title="Clear all recent stock movements history"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear movements</span>
            </button>
          )
        )}
      </div>

      <ul className="mt-2 divide-y border-y text-sm" data-testid="inventory-log">
        {(Array.isArray(log) ? log : []).slice(0, 50).map((l, i) => (
          <li key={i} className="flex flex-wrap justify-between gap-2 py-3">
            <span className="font-medium text-foreground">{l.slug}</span>
            <span className={l.delta > 0 ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-red-700 dark:text-red-400 font-semibold"}>
              {l.delta > 0 ? "+" : ""}{l.delta}
            </span>
            <span className="text-muted-foreground">→ {l.stock_after}</span>
            <span className="text-muted-foreground">{new Date(l.at).toLocaleString("en-IN")}</span>
          </li>
        ))}
        {!(Array.isArray(log) && log.length) && <li className="py-4 text-muted-foreground italic">No movements recorded.</li>}
      </ul>
      {editing && <ProductDialog product={editing} onClose={() => setEditing(null)} onSaved={refresh} />}
    </div>
  );
}
