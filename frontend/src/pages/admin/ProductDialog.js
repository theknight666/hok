import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, formatErr } from "@/lib/api";

const TEXT = [
  ["name", "Name"], ["slug", "URL slug"], ["tagline", "Tagline"], ["badge", "Badge"],
  ["concentration", "Concentration"], ["volume", "Volume"], ["image", "Image URL"], ["color", "Liquid colour (hex)"],
];
const NUM = [["price", "Price (₹)"], ["stock", "Stock"], ["low_stock_threshold", "Low-stock alert at"]];
const cls = "w-full border-b border-input bg-transparent py-2 text-sm outline-none focus:border-gold";

const toList = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function ProductDialog({ product, onClose, onSaved }) {
  const isNew = !product.slug;
  const [f, setF] = useState({
    name: "", slug: "", tagline: "", story: "", badge: "", concentration: "Eau de Parfum", volume: "100 ml",
    image: "", color: "#C5A059", price: 0, stock: 0, low_stock_threshold: 10, active: true, ...product,
    top: (product.notes?.top || []).join(", "), heart: (product.notes?.heart || []).join(", "), base: (product.notes?.base || []).join(", "),
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const body = {
      name: f.name, tagline: f.tagline, story: f.story, badge: f.badge, concentration: f.concentration, volume: f.volume,
      image: f.image, color: f.color, price: Number(f.price), stock: Number(f.stock), low_stock_threshold: Number(f.low_stock_threshold),
      active: f.active, notes: { top: toList(f.top), heart: toList(f.heart), base: toList(f.base) },
    };
    try {
      if (isNew) await api.post("/admin/products", { ...body, slug: f.slug.trim().toLowerCase().replace(/\s+/g, "-") });
      else await api.patch(`/admin/products/${product.slug}`, body);
      toast.success("Fragrance saved");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(formatErr(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-none bg-background" data-lenis-prevent data-testid="product-dialog">
        <DialogHeader><DialogTitle className="font-display text-3xl font-normal">{isNew ? "New fragrance" : `Edit ${product.name}`}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {TEXT.map(([k, l]) => (
            <label key={k} className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {l}
              <input value={f[k]} onChange={set(k)} disabled={k === "slug" && !isNew} required={["name", "slug"].includes(k)} className={cls} data-testid={`pd-${k}`} />
            </label>
          ))}
          {NUM.map(([k, l]) => (
            <label key={k} className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {l}
              <input type="number" min={0} value={f[k]} onChange={set(k)} className={cls} data-testid={`pd-${k}`} />
            </label>
          ))}
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground sm:col-span-2">
            Story
            <textarea rows={3} value={f.story} onChange={set("story")} className={`${cls} resize-none`} data-testid="pd-story" />
          </label>
          {["top", "heart", "base"].map((k) => (
            <label key={k} className="text-xs uppercase tracking-[0.2em] text-muted-foreground sm:col-span-2">
              {k} notes (comma separated)
              <input value={f[k]} onChange={set(k)} className={cls} data-testid={`pd-notes-${k}`} />
            </label>
          ))}
          <button disabled={busy} className="btn-royal mt-4 sm:col-span-2" data-testid="pd-save"><span>{busy ? "Saving…" : "Save fragrance"}</span></button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
