export const WORLDS = {
  "blonde-amber": { bg: "#F2A900", ink: "#1C1105", soft: "#FFD766" },
  layton: { bg: "#2338DB", ink: "#F3F5FF", soft: "#93A4FF" },
  "angels-share-on-the-rocks": { bg: "#C9471B", ink: "#FFF1E4", soft: "#FFA06A" },
  "side-effect": { bg: "#4B0F2C", ink: "#FFE4EE", soft: "#D13C78" },
};

const DEFAULT_WORLD = { bg: "#110E13", ink: "#F6EFE4", soft: "#8c8c8c" };

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
