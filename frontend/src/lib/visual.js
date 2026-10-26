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

export const noteSlug = (n) =>
  String(n || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const NOTE_IMAGE_MAP = {
  "apple": "/images/notes/apple.png",
  "bitter-orange": "/images/notes/bitter-orange.png",
  "blonde-tobacco": "/images/notes/blonde-tobacco.png",
  "tobacco": "/images/notes/tobacco.png",
  "cinnamon": "/images/notes/cinnamon.png",
  "cognac": "/images/notes/cognac.png",
  "lavender": "/images/notes/lavender.png",
  "oak": "/images/notes/oak.png",
  "saffron": "/images/notes/saffron.png",
  "sandalwood": "/images/notes/sandalwood.png",
  "vanilla": "/images/notes/vanilla.png",
  "mandarin-orange": "/images/notes/mandarin-orange.png",
  "mandarin": "/images/notes/mandarin-orange.png",
  "nutmeg": "/images/notes/nutmeg.png",
  "amber": "/images/notes/amber.jpg",
  "woody-amber": "/images/notes/woody-amber.jpg",
  "bergamot": "/images/notes/bergamot.jpg",
  "frozen-bergamot": "/images/notes/frozen-bergamot.jpg",
  "cardamom": "/images/notes/cardamom.jpg",
  "cedarwood": "/images/notes/cedarwood.jpg",
  "cedar": "/images/notes/cedarwood.jpg",
  "guaiac-wood": "/images/notes/guaiac-wood.jpg",
  "jasmine": "/images/notes/jasmine.jpg",
  "leather": "/images/notes/leather.jpg",
  "orris": "/images/notes/orris.jpg",
  "orris-root": "/images/notes/orris.jpg",
  "patchouli": "/images/notes/patchouli.jpg",
  "pink-pepper": "/images/notes/pink-pepper.jpg",
  "white-pepper": "/images/notes/white-pepper.jpg",
  "praline": "/images/notes/praline.jpg",
  "rum": "/images/notes/rum.jpg",
  "tonka": "/images/notes/tonka.jpg",
  "tonka-bean": "/images/notes/tonka-bean.jpg",
  "violet": "/images/notes/violet.jpg",
  "ginger": "/images/notes/ginger.jpg",
  "dried-fruits": "/images/notes/dried-fruits.jpg",
  "olibanum": "/images/notes/olibanum.jpg",
  "myrrh": "/images/notes/myrrh.jpg",
  "labdanum": "/images/notes/labdanum.jpg",
  "musk": "/images/notes/musk.jpg",
};

export const getNoteImage = (n) => {
  if (!n) return null;
  const slug = noteSlug(n);
  if (NOTE_IMAGE_MAP[slug]) return NOTE_IMAGE_MAP[slug];
  for (const [key, path] of Object.entries(NOTE_IMAGE_MAP)) {
    if (slug.includes(key) || key.includes(slug)) return path;
  }
  return null;
};

export const noteImages = (notes, n = 3) =>
  [...(notes?.top || []), ...(notes?.heart || []), ...(notes?.base || [])]
    .filter((x) => Boolean(getNoteImage(x)))
    .filter((x, i, a) => a.indexOf(x) === i)
    .slice(0, n)
    .map((x) => ({ name: x, src: getNoteImage(x) }));

export const featuredFirst = (products) => [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

export const KNOWN_NOTES = [
  { name: "Amber", category: "Resins & Amber" },
  { name: "Apple", category: "Fruits & Citrus" },
  { name: "Bergamot", category: "Fruits & Citrus" },
  { name: "Bitter Orange", category: "Fruits & Citrus" },
  { name: "Blonde Tobacco", category: "Tobacco & Leather" },
  { name: "Cardamom", category: "Spices" },
  { name: "Cedarwood", category: "Woods" },
  { name: "Cinnamon", category: "Spices" },
  { name: "Cognac", category: "Spirits & Gourmands" },
  { name: "Dried Fruits", category: "Fruits & Citrus" },
  { name: "Frozen Bergamot", category: "Fruits & Citrus" },
  { name: "Ginger", category: "Spices" },
  { name: "Guaiac Wood", category: "Woods" },
  { name: "Jasmine", category: "Florals" },
  { name: "Labdanum", category: "Resins & Amber" },
  { name: "Lavender", category: "Florals & Aromatics" },
  { name: "Leather", category: "Tobacco & Leather" },
  { name: "Mandarin Orange", category: "Fruits & Citrus" },
  { name: "Musk", category: "Musk & Animalic" },
  { name: "Myrrh", category: "Resins & Amber" },
  { name: "Nutmeg", category: "Spices" },
  { name: "Oak", category: "Woods" },
  { name: "Olibanum", category: "Resins & Amber" },
  { name: "Orris", category: "Florals" },
  { name: "Patchouli", category: "Woods & Earth" },
  { name: "Pink Pepper", category: "Spices" },
  { name: "Praline", category: "Spirits & Gourmands" },
  { name: "Rum", category: "Spirits & Gourmands" },
  { name: "Saffron", category: "Spices" },
  { name: "Sandalwood", category: "Woods" },
  { name: "Tobacco", category: "Tobacco & Leather" },
  { name: "Tonka Bean", category: "Spirits & Gourmands" },
  { name: "Vanilla", category: "Spirits & Gourmands" },
  { name: "Violet", category: "Florals" },
  { name: "White Pepper", category: "Spices" },
  { name: "Woody Amber", category: "Resins & Amber" },
];
