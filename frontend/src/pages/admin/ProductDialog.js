import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, X, Plus, Search, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, formatErr } from "@/lib/api";
import { BottleUpload } from "./BottleUpload";
import { getCachedCatalog, setCachedCatalog } from "@/hooks/useProducts";
import { getNoteImage, KNOWN_NOTES, isValidImageUrl, defaultCutoutOf, DEFAULT_MAJOR_NOTES } from "@/lib/visual";

const TEXT = [
  ["name", "Name"],
  ["slug", "URL slug"],
  ["tagline", "Tagline"],
  ["badge", "Badge"],
  ["concentration", "Concentration (e.g. EDP)"],
  ["volume", "Volume"],
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

const TIERS_CONFIG = [
  { key: "top", title: "Top Notes", subtitle: "The opening · first 15 minutes · volatile aromatics & effervescence" },
  { key: "heart", title: "Heart Notes", subtitle: "The character · 15 mins to 4 hours · soul of the fragrance" },
  { key: "base", title: "Base Notes", subtitle: "The legacy & drydown · 4 to 12+ hours · deep woods, resins & absolutes" },
];

function NoteTierBuilder({ tierKey, title, subtitle, notesList, onNotesChange, rawString, onRawChange }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [search, setSearch] = useState("");
  const [customNote, setCustomNote] = useState("");

  const move = (idx, delta) => {
    const target = idx + delta;
    if (target < 0 || target >= notesList.length) return;
    const next = [...notesList];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    onNotesChange(next);
  };

  const remove = (idx) => {
    onNotesChange(notesList.filter((_, i) => i !== idx));
  };

  const add = (noteName) => {
    const trimmed = (noteName || "").trim();
    if (!trimmed) return;
    if (notesList.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already added to ${title}`);
      return;
    }
    onNotesChange([...notesList, trimmed]);
  };

  const handleCustomAdd = (e) => {
    e.preventDefault();
    if (!customNote.trim()) return;
    add(customNote);
    setCustomNote("");
  };

  const availableNotes = KNOWN_NOTES.filter(
    (n) =>
      !notesList.some((existing) => existing.toLowerCase() === n.name.toLowerCase()) &&
      n.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sm:col-span-2 rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3.5 transition-all shadow-sm">
      {/* Tier Header with Note Counter and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold" />
            <h5 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              {title}
            </h5>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              {notesList.length} {notesList.length === 1 ? "note" : "notes"} · In order of dominance
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRaw(!showRaw)}
            className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
          >
            {showRaw ? "Hide Text" : "Bulk Edit"}
          </button>
          <button
            type="button"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold transition-colors hover:bg-gold hover:text-black cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isPickerOpen ? "Done Picking" : "+ Select Notes"}</span>
          </button>
        </div>
      </div>

      {/* Selected Notes (Dominance Flow) */}
      {notesList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-4 text-center text-xs text-muted-foreground">
          No notes selected for {title}. Click <strong className="text-gold">+ Select Notes</strong> above to choose ingredients.
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {notesList.map((note, idx) => {
            const img = getNoteImage(note);
            return (
              <div
                key={`${note}-${idx}`}
                className="group relative inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1.5 pr-2.5 text-xs font-medium shadow-sm transition-all hover:border-gold/70 hover:shadow-md"
              >
                {/* Dominance Rank Badge */}
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted font-mono text-[9px] font-bold text-muted-foreground">
                  {idx + 1}
                </span>

                {/* Note Thumbnail Icon */}
                <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted shadow-inner">
                  {img ? (
                    <img src={img} alt={note} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">
                      {note.slice(0, 2)}
                    </span>
                  )}
                </div>

                {/* Note Title */}
                <span className="font-medium text-foreground">{note}</span>

                {/* Reorder and Delete Controls */}
                <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-border/50">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => move(idx, -1)}
                    title="Increase dominance (move earlier in list)"
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === notesList.length - 1}
                    onClick={() => move(idx, 1)}
                    title="Decrease dominance (move later in list)"
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    title="Remove note"
                    className="rounded p-0.5 text-destructive/70 hover:bg-destructive/15 hover:text-destructive cursor-pointer ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional Raw Comma-Separated Text Input for Bulk Operations */}
      {showRaw && (
        <div className="pt-1">
          <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
            Bulk Edit (comma separated in order of dominance):
          </label>
          <input
            value={rawString}
            onChange={(e) => onRawChange(e.target.value)}
            className={`${cls} text-xs font-mono`}
            placeholder="e.g. Vanilla, Sandalwood, Amber, Patchouli"
          />
        </div>
      )}

      {/* Expandable Visual Note Library & Quick-Add Palette */}
      {isPickerOpen && (
        <div className="rounded-xl border border-border/80 bg-background/95 p-3.5 space-y-3 shadow-lg">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Filter */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search note catalog (e.g. Amber, Bergamot, Rum, Saffron)..."
                className="w-full rounded-lg border border-input bg-muted/30 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-gold"
              />
            </div>

            {/* Custom note form */}
            <form onSubmit={handleCustomAdd} className="flex items-center gap-1.5">
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Type custom note..."
                className="w-36 sm:w-44 rounded-lg border border-input bg-muted/30 py-1.5 px-2.5 text-xs outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-semibold text-background hover:bg-gold hover:text-black transition-colors cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* Quick-Click Visual Note Chips */}
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1" data-lenis-prevent>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Click any note to add to {title}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableNotes.map((item) => {
                const img = getNoteImage(item.name);
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => add(item.name)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 py-1 pl-1 pr-2.5 text-xs text-foreground transition-all hover:scale-105 hover:border-gold hover:bg-gold/15 cursor-pointer"
                  >
                    <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border/50 bg-background">
                      {img ? (
                        <img src={img} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[8px] font-bold">
                          {item.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <span>{item.name}</span>
                    <Plus className="h-3 w-3 opacity-50" />
                  </button>
                );
              })}
              {availableNotes.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">
                  No matching catalog notes. Use the input on the right to add a custom note!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MajorNotesManager({ majorNotes = [], onChange, allNotesList = [] }) {
  const [customInput, setCustomInput] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleAdd = (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    if (majorNotes.includes(trimmed)) return;
    onChange([...majorNotes, trimmed]);
  };

  const handleRemove = (idx) => {
    onChange(majorNotes.filter((_, i) => i !== idx));
  };

  const handleMove = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= majorNotes.length) return;
    const next = [...majorNotes];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    onChange(next);
  };

  const candidateNotes = Array.from(new Set([
    ...allNotesList,
    ...KNOWN_NOTES.map((k) => k.name),
  ])).filter((name) => !majorNotes.includes(name));

  return (
    <div className="sm:col-span-2 rounded-2xl border border-gold/40 bg-card/60 p-4 space-y-3.5 shadow-sm" data-testid="major-notes-manager">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Homepage Display Notes ({majorNotes.length} Major Notes)
            </span>
            <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">
              Featured Cards · Bottom-Left Pills
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Customize the prominent notes displayed on the home page card at the bottom-left (e.g. Rum, Blonde Tobacco, Amber, Bourbon Vanilla, Dried Fruits, Olibanum).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className="rounded-lg border border-gold/60 bg-gold/15 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-gold hover:text-black transition-colors cursor-pointer"
        >
          {isPickerOpen ? "Done Picking" : "+ Select / Add Note"}
        </button>
      </div>

      {/* Selected Major Notes Pills */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        {majorNotes.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No custom notes selected. The House will automatically display the top defining accords of this fragrance.
          </p>
        ) : (
          majorNotes.map((note, idx) => {
            const img = getNoteImage(note);
            return (
              <div
                key={note + idx}
                className="group relative inline-flex items-center gap-2 rounded-full border border-gold/50 bg-background/90 py-1 pl-1.5 pr-2.5 text-xs font-medium shadow-sm hover:border-gold transition-all"
              >
                <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border/50 bg-background flex items-center justify-center">
                  {img ? (
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      {note.slice(0, 2)}
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-foreground">{note}</span>

                <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      className="text-[10px] text-muted-foreground hover:text-foreground px-0.5 cursor-pointer"
                      title="Move left"
                    >
                      ◀
                    </button>
                  )}
                  {idx < majorNotes.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      className="text-[10px] text-muted-foreground hover:text-foreground px-0.5 cursor-pointer"
                      title="Move right"
                    >
                      ▶
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="ml-1 text-muted-foreground hover:text-destructive text-xs font-bold leading-none cursor-pointer"
                    title="Remove note"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Note Picker Drawer */}
      {isPickerOpen && (
        <div className="rounded-xl border border-border/80 bg-background/95 p-3.5 space-y-3 shadow-lg">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type any custom note (e.g. Olibanum, Tuberose, Rum)..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd(customInput);
                  setCustomInput("");
                }
              }}
              className="flex-1 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                handleAdd(customInput);
                setCustomInput("");
              }}
              disabled={!customInput.trim()}
              className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-gold hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
            >
              Add
            </button>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Suggested Notes from Pyramid & Catalog
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {candidateNotes.map((name) => {
                const img = getNoteImage(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleAdd(name)}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 px-2 py-1 text-xs hover:border-gold hover:bg-gold/10 transition-colors cursor-pointer"
                  >
                    {img && (
                      <img src={img} alt="" className="h-4 w-4 rounded-full object-cover" />
                    )}
                    <span>+ {name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductDialog({ product, onClose, onSaved }) {
  const isNew = !product.slug;
  const [f, setF] = useState(() => {
    const topNotes = product.notes?.top || (product.top ? toList(product.top) : []);
    const heartNotes = product.notes?.heart || (product.heart ? toList(product.heart) : []);
    const baseNotes = product.notes?.base || (product.base ? toList(product.base) : []);
    const initialMajorNotes = Array.isArray(product.major_notes) && product.major_notes.length > 0
      ? product.major_notes
      : (product.slug && DEFAULT_MAJOR_NOTES[product.slug] ? DEFAULT_MAJOR_NOTES[product.slug] : []);

    return {
      name: "",
      slug: "",
      tagline: "",
      story: "",
      badge: "",
      concentration: "EDP",
      volume: "50 ml",
      image: "",
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
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
      top: topNotes.join(", "),
      heart: heartNotes.join(", "),
      base: baseNotes.join(", "),
      top_list: topNotes,
      heart_list: heartNotes,
      base_list: baseNotes,
      major_notes: initialMajorNotes,
      ...product,
      major_notes: initialMajorNotes,
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
      top_list: topNotes,
      heart_list: heartNotes,
      base_list: baseNotes,
      top: topNotes.join(", "),
      heart: heartNotes.join(", "),
      base: baseNotes.join(", "),
      ...(product.accords ? {
        accords_str: (product.accords || []).map((a) => `${a.name}: ${a.pct}`).join(", "),
      } : {}),
      ...(product.architecture ? {
        arch_longevity: product.architecture.longevity || "12+ Hours · Enduring Aura",
        arch_sillage: product.architecture.sillage || "Intense · Regal Radiance",
        arch_season: product.architecture.season || "Autumn / Winter / Sovereign Evenings",
        arch_profile: product.architecture.profile || "",
      } : {}),
    };
  });

  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/products/${product.slug}`);
      toast.success(`"${product.name}" deleted permanently`);
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      onSaved();
      onClose();
    } catch (err) {
      toast.error(formatErr(err));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const updateTierNotes = (tierKey, nextList) => {
    setF((prev) => ({
      ...prev,
      [`${tierKey}_list`]: nextList,
      [tierKey]: nextList.join(", "),
    }));
  };

  const handleRawNotesChange = (tierKey, rawValue) => {
    setF((prev) => ({
      ...prev,
      [tierKey]: rawValue,
      [`${tierKey}_list`]: toList(rawValue),
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);

    const parsedAccordsList = parseAccords(f.accords_str);
    const savedSlug = isNew ? f.slug.trim().toLowerCase().replace(/\s+/g, "-") : product.slug;

    const rawImgs = Array.isArray(f.images) && f.images.length > 0 ? f.images : (f.image ? [f.image] : []);
    const cleanImages = rawImgs.filter(isValidImageUrl);
    const defaultCut = defaultCutoutOf(savedSlug);
    const finalImages = cleanImages.length > 0 ? cleanImages : [defaultCut];
    const finalPrimary = isValidImageUrl(f.image) ? f.image : finalImages[0];

    const body = {
      name: f.name,
      tagline: f.tagline,
      story: f.story,
      badge: f.badge,
      concentration: f.concentration || "EDP",
      volume: f.volume || "50 ml",
      image: finalPrimary,
      images: finalImages,
      color: f.color,
      price: Number(f.price),
      sample_price: Number(f.sample_price || 99),
      stock: Number(f.stock),
      low_stock_threshold: Number(f.low_stock_threshold),
      active: f.active,
      featured: f.featured,
      notes: {
        top: f.top_list && f.top_list.length ? f.top_list : toList(f.top),
        heart: f.heart_list && f.heart_list.length ? f.heart_list : toList(f.heart),
        base: f.base_list && f.base_list.length ? f.base_list : toList(f.base),
      },
      major_notes: Array.isArray(f.major_notes) ? f.major_notes : [],
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

      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", savedSlug] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });

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
      <DialogContent className="max-h-[92vh] max-w-3xl w-[95vw] sm:w-full overflow-y-auto overflow-x-hidden rounded-[2rem] bg-background p-5 sm:p-8 min-w-0" data-lenis-prevent data-testid="product-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">
            {isNew ? "New fragrance" : `Edit ${product.name}`}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Manage fragrance specifications, story, note structure, dominant accords, and performance architecture.
          </p>
        </DialogHeader>

        <form onSubmit={save} className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <BottleUpload
              slug={isNew ? null : product.slug}
              image={f.image}
              images={f.images}
              onChange={({ image, images }) => {
                setF((c) => ({
                  ...c,
                  image: image || (images && images[0]) || "",
                  images: images || [],
                }));
              }}
              onDone={(p) => {
                if (p.image) setF((c) => ({ ...c, image: p.image }));
                if (p.images) setF((c) => ({ ...c, images: p.images }));
                if (!isNew) onSaved();
              }}
            />
          </div>

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
            <textarea rows={4} value={f.story} onChange={set("story")} className={`${cls} resize-none leading-relaxed break-words [overflow-wrap:anywhere]`} data-testid="pd-story" placeholder="Write the fragrance story..." />
          </label>


          <div className="sm:col-span-2 border-b pt-4 pb-2">
            <h4 className="font-display text-lg flex items-center gap-2">
              <span>Full Note Structure & Pyramid</span>
              <Sparkles className="h-4 w-4 text-gold" />
            </h4>
            <p className="text-xs text-muted-foreground">
              Visually select, add, remove, and reorder notes by dominance using the controls below. Each note renders with its authentic ingredient photograph.
            </p>
          </div>

          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground sm:col-span-2">
            Olfactory Family
            <input value={f.olfactory_family} onChange={set("olfactory_family")} className={cls} placeholder="e.g. Warm Amber Spicy · Oriental Gourmand" data-testid="pd-olfactory-family" />
          </label>

          {/* Interactive Homepage Display Notes Builder */}
          <MajorNotesManager
            majorNotes={f.major_notes || []}
            onChange={(nextNotes) => setF((prev) => ({ ...prev, major_notes: nextNotes }))}
            allNotesList={[
              ...(f.top_list || []),
              ...(f.heart_list || []),
              ...(f.base_list || []),
            ]}
          />

          {/* Interactive Visual Note Tier Builders */}
          {TIERS_CONFIG.map(({ key, title, subtitle }) => (
            <NoteTierBuilder
              key={key}
              tierKey={key}
              title={title}
              subtitle={subtitle}
              notesList={f[`${key}_list`] || []}
              onNotesChange={(nextList) => updateTierNotes(key, nextList)}
              rawString={f[key]}
              onRawChange={(val) => handleRawNotesChange(key, val)}
            />
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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 sm:col-span-2 pt-3 border-t border-border/50">
            {!isNew ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive font-semibold">Delete permanently?</span>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground hover:opacity-90 cursor-pointer"
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs uppercase tracking-[0.2em] text-destructive/80 hover:text-destructive hover:underline cursor-pointer"
                >
                  Delete fragrance
                </button>
              )
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost-royal !px-5 !py-2.5 text-xs uppercase tracking-[0.2em]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn-royal !px-6 !py-2.5"
                data-testid="pd-save"
              >
                <span>{busy ? "Saving…" : "Save fragrance"}</span>
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
