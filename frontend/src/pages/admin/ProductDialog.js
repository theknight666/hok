import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, formatErr } from "@/lib/api";
import { BottleUpload } from "./BottleUpload";
import { getCachedCatalog, setCachedCatalog } from "@/hooks/useProducts";

const TEXT = [
  ["name", "Name"],
  ["slug", "URL slug"],
  ["tagline", "Tagline"],
  ["badge", "Badge"],
  ["concentration", "Concentration (e.g. EDP)"],
  ["volume", "Volume"],
  ["image", "Image URL (or upload below)"],
  ["color", "Liquid colour (hex)"],
];

const NUM = [
  ["price", "50 ml Price (₹)"],
  ["sample_price", "2 ml Sample Price (₹)"],
  ["stock", "Stock (bottles)"],
  ["low_stock_threshold", "Low-stock alert at"],
];

const cls = "w-full border-b border-input bg-transparent py-2 text-sm outline-none focus:border-gold transition-colors";

const toList = (s) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);

const parseAccords = (str) => {
  if (!str) return [];
  return str.split(",").map((item) => {
    const parts = item.split(":");
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const pct = parseInt(parts[1].replace("%", "").trim(), 10) || 50;
      return { name, pct };
    }
    return { name: item.trim(), pct: 80 };
  }).filter((x) => Boolean(x.name));
};

export function ProductDialog({ product, onClose, onSaved }) {
  const isNew = !product.slug;
  const [f, setF] = useState({
    name: "",
    slug: "",
    tagline: "",
    story: "",
    badge: "",
    concentration: "EDP",
    volume: "50 ml",
    image: "",
    color: "#C5A059",
    price: 0,
    sample_price: 99,
    stock: 0,
    low_stock_threshold: 10,
    active: true,
    featured: false,
    olfactory_family: product.olfactory_family || "",
    accords_str: (product.accords || []).map((a) => `${a.name}: ${a.pct}`).join(", "),
    arch_longevity: product.architecture?.longevity || "12+ Hours · Enduring Aura",
    arch_sillage: product.architecture?.sillage || "Intense · Regal Radiance",
    arch_season: product.architecture?.season || "Autumn / Winter / Sovereign Evenings",
    arch_profile: product.architecture?.profile || "",
    top: (product.notes?.top || []).join(", "),
    heart: (product.notes?.heart || []).join(", "),
    base: (product.notes?.base || []).join(", "),
    ...product,
    // ensure strings are formatted properly even if product overrides
    ...(product.notes ? {
      top: (product.notes.top || []).join(", "),
      heart: (product.notes.heart || []).join(", "),
      base: (product.notes.base || []).join(", "),
    } : {}),
    ...(product.accords ? {
      accords_str: (product.accords || []).map((a) => `${a.name}: ${a.pct}`).join(", "),
    } : {}),
    ...(product.architecture ? {
      arch_longevity: product.architecture.longevity || "12+ Hours · Enduring Aura",
      arch_sillage: product.architecture.sillage || "Intense · Regal Radiance",
      arch_season: product.architecture.season || "Autumn / Winter / Sovereign Evenings",
      arch_profile: product.architecture.profile || "",
    } : {}),
  });

  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);

    const parsedAccordsList = parseAccords(f.accords_str);

    const body = {
      name: f.name,
      tagline: f.tagline,
      story: f.story,
      badge: f.badge,
      concentration: f.concentration || "EDP",
      volume: f.volume || "50 ml",
      image: f.image,
      color: f.color,
      price: Number(f.price),
      sample_price: Number(f.sample_price || 99),
      stock: Number(f.stock),
      low_stock_threshold: Number(f.low_stock_threshold),
      active: f.active,
      featured: f.featured,
      notes: {
        top: toList(f.top),
        heart: toList(f.heart),
        base: toList(f.base),
      },
      olfactory_family: f.olfactory_family || "",
      accords: parsedAccordsList,
      architecture: {
        longevity: f.arch_longevity || "12+ Hours · Enduring Aura",
        sillage: f.arch_sillage || "Intense · Regal Radiance",
        season: f.arch_season || "Autumn / Winter / Sovereign Evenings",
        concentration: "EDP",
        profile: f.arch_profile || "",
      },
    };

    try {
      const savedSlug = isNew ? f.slug.trim().toLowerCase().replace(/\s+/g, "-") : product.slug;
      if (isNew) await api.post("/admin/products", { ...body, slug: savedSlug });
      else await api.patch(`/admin/products/${product.slug}`, body);

      try {
        const current = [...getCachedCatalog()];
        const fullSaved = { ...body, slug: savedSlug };
        const idx = current.findIndex((p) => p.slug === savedSlug);
        if (idx >= 0) current[idx] = { ...current[idx], ...fullSaved };
        else current.push(fullSaved);
        setCachedCatalog(current);
      } catch (err) {
        // Non-blocking cache sync
      }

      toast.success("Fragrance saved successfully");
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
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-[2rem] bg-background p-6 sm:p-8" data-lenis-prevent data-testid="product-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">
            {isNew ? "New fragrance" : `Edit ${product.name}`}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Manage fragrance specifications, story, note structure, dominant accords, and performance architecture.
          </p>
        </DialogHeader>

        <form onSubmit={save} className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {!isNew && (
            <div className="sm:col-span-2">
              <BottleUpload slug={product.slug} image={f.image} onDone={(p) => { setF((c) => ({ ...c, image: p.image })); onSaved(); }} />
            </div>
          )}

          <div className="sm:col-span-2 border-b pb-2">
            <h4 className="font-display text-lg">General Information</h4>
          </div>

          {TEXT.map(([k, l]) => (
            <label key={k} className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {l}
              <input value={f[k]} onChange={set(k)} disabled={k === "slug" && !isNew} required={["name", "slug"].includes(k)} className={cls} data-testid={`pd-${k}`} />
            </label>
          ))}

          {NUM.map(([k, l]) => (
            <label key={k} className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {l}
              <input type="number" min={0} value={f[k]} onChange={set(k)} className={cls} data-testid={`pd-${k}`} />
            </label>
          ))}

          <div className="sm:col-span-2 border-b pt-4 pb-2">
            <h4 className="font-display text-lg">Fragrance Story</h4>
            <p className="text-xs text-muted-foreground">The narrative displayed on the product showcase.</p>
          </div>

          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:col-span-2">
            Story Narrative
            <textarea rows={4} value={f.story} onChange={set("story")} className={`${cls} resize-none leading-relaxed`} data-testid="pd-story" placeholder="Write the fragrance story..." />
          </label>

          <div className="sm:col-span-2 border-b pt-4 pb-2">
            <h4 className="font-display text-lg">Full Note Structure & Pyramid</h4>
            <p className="text-xs text-muted-foreground">Enter notes comma-separated in order of dominance (most prominent first). Each will automatically pair with ingredient images.</p>
          </div>

          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:col-span-2">
            Olfactory Family
            <input value={f.olfactory_family} onChange={set("olfactory_family")} className={cls} placeholder="e.g. Warm Amber Spicy · Oriental Gourmand" data-testid="pd-olfactory-family" />
          </label>

          {["top", "heart", "base"].map((k) => (
            <label key={k} className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:col-span-2">
              {k} notes (in order of dominance, comma separated)
              <input value={f[k]} onChange={set(k)} className={cls} placeholder={`e.g. ${k === "top" ? "Bitter Orange, Rum, Pink Pepper" : k === "heart" ? "Blonde Tobacco, Orris, Dried Fruits" : "Amber, Vanilla, Tonka Bean"}`} data-testid={`pd-notes-${k}`} />
            </label>
          ))}

          <div className="sm:col-span-2 border-b pt-4 pb-2">
            <h4 className="font-display text-lg">Scent Architecture & Dominant Accords</h4>
            <p className="text-xs text-muted-foreground">Configure the harmonic balance and performance pillars.</p>
          </div>

          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:col-span-2">
            Dominant Accords (Format: Accord Name: Percentage, ...)
            <input
              value={f.accords_str}
              onChange={set("accords_str")}
              className={cls}
              placeholder="e.g. Amber Resin: 95, Warm Spice: 90, Sweet Tobacco: 86, Bourbon Vanilla: 82"
              data-testid="pd-accords"
            />
            <span className="mt-1 block text-[11px] text-muted-foreground normal-case">
              Names will be displayed in full without truncation. Percentages determine the progress bar widths.
            </span>
          </label>

          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Longevity Pillar
            <input value={f.arch_longevity} onChange={set("arch_longevity")} className={cls} placeholder="e.g. 12+ Hours · Enduring Aura" data-testid="pd-arch-longevity" />
          </label>

          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Sillage Pillar
            <input value={f.arch_sillage} onChange={set("arch_sillage")} className={cls} placeholder="e.g. Intense · Regal Radiance" data-testid="pd-arch-sillage" />
          </label>

          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:col-span-2">
            Season / Recommended Occasion
            <input value={f.arch_season} onChange={set("arch_season")} className={cls} placeholder="e.g. Autumn / Winter / Sovereign Evenings" data-testid="pd-arch-season" />
          </label>

          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:col-span-2">
            Olfactory Journey (Detailed Narrative)
            <textarea rows={3} value={f.arch_profile} onChange={set("arch_profile")} className={`${cls} resize-none leading-relaxed`} placeholder="Describe the progression from top notes through the drydown..." data-testid="pd-arch-profile" />
          </label>

          <div className="flex flex-wrap gap-6 sm:col-span-2 pt-2">
            {[["active", "Visible in store"], ["featured", "Featured on home page (hero + spotlight)"]].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={!!f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} className="h-4 w-4 accent-[hsl(var(--gold))]" data-testid={`pd-${k}`} />
                {l}
              </label>
            ))}
          </div>

          <button disabled={busy} className="btn-royal mt-4 sm:col-span-2" data-testid="pd-save">
            <span>{busy ? "Saving…" : "Save fragrance"}</span>
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
