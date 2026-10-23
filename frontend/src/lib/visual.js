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
