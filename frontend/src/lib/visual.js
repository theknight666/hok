export const WORLDS = {
  "blonde-amber": { bg: "#A8741F", ink: "#1C1205", soft: "#F2CB6E" },
  layton: { bg: "#0E1B45", ink: "#E7ECFA", soft: "#3C5FC4" },
  "angels-share-on-the-rocks": { bg: "#46200F", ink: "#F6E4D2", soft: "#B4651F" },
  "side-effect": { bg: "#26091C", ink: "#F1DCE5", soft: "#7A2552" },
};

const DEFAULT_WORLD = { bg: "#0C0B0E", ink: "#F3EEE5", soft: "#B08D3C" };

export const worldOf = (p) => WORLDS[p?.slug] || { ...DEFAULT_WORLD, bg: p?.color || DEFAULT_WORLD.bg };

export const worldVars = (w) => ({ "--w-bg": w.bg, "--w-ink": w.ink, "--w-soft": w.soft, background: w.bg, color: w.ink });

export const cutout = (p) =>
  p?.image ? p.image.replace("/images/", "/images/cut-").replace(/\.(jpg|jpeg|webp)$/i, ".png") : "";

export const flatNotes = (notes, n = 5) =>
  [...(notes?.top || []), ...(notes?.heart || []), ...(notes?.base || [])].slice(0, n);

/** Raw-ingredient renders available under /public/images/notes. */
const NOTE_IMAGES = new Set(["bitter-orange", "blonde-tobacco", "vanilla", "apple", "lavender", "sandalwood", "cognac", "cinnamon", "oak", "saffron"]);
export const noteSlug = (n) => n.toLowerCase().trim().replace(/\s+/g, "-");
export const noteImages = (notes, n = 3) =>
  [...(notes?.top || []), ...(notes?.heart || []), ...(notes?.base || [])]
    .filter((x) => NOTE_IMAGES.has(noteSlug(x)))
    .filter((x, i, a) => a.indexOf(x) === i)
    .slice(0, n)
    .map((x) => ({ name: x, src: `/images/notes/${noteSlug(x)}.png` }));

export const featuredFirst = (products) => [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
