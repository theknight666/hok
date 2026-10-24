export const WORLDS = {
  "blonde-amber": { bg: "#3A2A10", ink: "#F3E4C2", soft: "#C9962B" },
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
