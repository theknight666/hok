import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const FALLBACK_PRODUCTS = [
  {
    slug: "blonde-amber",
    name: "Blonde Amber",
    order: 1,
    color: "#D4A24C",
    badge: "The Signature",
    tagline: "Liquid gold, warm resins and a whisper of smoke.",
    story: "A radiant amber that glows like candlelight on gilded walls — warm, golden and unmistakably regal. Conceived as a celebration of sovereign decadence, it weaves precious golden resins, smoky blonde tobacco and vintage rum into a captivating trail of timeless grandeur.",
    concentration: "Eau de Parfum",
    volume: "50 ml",
    price: 1599,
    stock: 44,
    olfactory_family: "Warm Amber Spicy · Oriental Gourmand",
    accords: [
      { name: "Amber Resin", pct: 95 },
      { name: "Warm Spice", pct: 90 },
      { name: "Sweet Blonde Tobacco", pct: 86 },
      { name: "Bourbon Vanilla", pct: 82 },
      { name: "Sunlit Citrus", pct: 68 },
      { name: "Precious Woods", pct: 60 },
    ],
    architecture: {
      longevity: "12+ Hours · Enduring Aura",
      sillage: "Intense · Regal Radiance",
      season: "Autumn / Winter / Sovereign Evenings",
      concentration: "EDP",
      profile: "An imperial opening of sun-drenched bitter orange and fizzing pink pepper steeped in aged rum, revealing a heart of velvety blonde tobacco and powdery Tuscan orris, grounded on molten amber resin, tonka and bourbon vanilla.",
    },
    notes: {
      top: ["Bitter Orange", "Rum", "Pink Pepper", "Cardamom", "Bergamot", "Ginger"],
      heart: ["Blonde Tobacco", "Orris", "Dried Fruits", "Sandalwood", "Saffron", "White Pepper", "Jasmine"],
      base: ["Amber", "Vanilla", "Tonka Bean", "Cedarwood", "Labdanum", "Myrrh", "Patchouli", "Musk"],
    },
    image: "/images/blonde-amber.jpg",
    low_stock_threshold: 10,
    active: true,
    featured: true,
    sample_price: 99,
  },
  {
    slug: "layton",
    name: "Layton",
    order: 2,
    color: "#1E2F5C",
    badge: "The Noble",
    tagline: "Crisp bergamot, lavender and warm woods.",
    story: "Composed with the poise of a knight in royal court — fresh and invigorating at first, then deep, warm and commanding. An aristocratic harmony of wild French lavender, tart green apple and precious woods designed for those who lead with quiet authority.",
    concentration: "Eau de Parfum",
    volume: "50 ml",
    price: 1499,
    stock: 50,
    olfactory_family: "Amber Floral · Aristocratic Fresh Woody",
    accords: [
      { name: "Warm Spicy", pct: 94 },
      { name: "Aromatic Lavender", pct: 88 },
      { name: "Crisp Apple & Citrus", pct: 85 },
      { name: "Bourbon Vanilla", pct: 80 },
      { name: "Noble Woods", pct: 74 },
    ],
    architecture: {
      longevity: "10–12 Hours · All-Day Sillage",
      sillage: "Heavy · Commanding Aura",
      season: "All-Season Signature · Court & Evening",
      concentration: "EDP",
      profile: "Tart crisp apple and Italian bergamot infused with wild French lavender, drifting into an aristocratic heart of night-blooming jasmine and violet, resting on a grand bed of vanilla, creamy sandalwood and guaiac wood.",
    },
    notes: {
      top: ["Apple", "Lavender", "Bergamot", "Mandarin Orange"],
      heart: ["Jasmine", "Violet", "Cardamom", "Pink Pepper"],
      base: ["Vanilla", "Sandalwood", "Guaiac Wood", "Amber", "Patchouli"],
    },
    image: "/images/layton.jpg",
    low_stock_threshold: 10,
    active: true,
    featured: true,
    sample_price: 99,
  },
  {
    slug: "angels-share-on-the-rocks",
    name: "Angels Share On The Rocks",
    order: 3,
    color: "#8A4B1F",
    badge: "The Reserve",
    tagline: "Cognac, cinnamon and oak — served over ice.",
    story: "An ode to the sacred spirit lost to the heavens as cognac ages in French oak, poured cold over crystal ice. Rich with spicy cinnamon, roasted praline and aged eau-de-vie, it captures the hedonistic warmth of late-night indulgence in an opulent salon.",
    concentration: "Eau de Parfum",
    volume: "50 ml",
    price: 1549,
    stock: 50,
    olfactory_family: "Warm Gourmand · Boozy Amber Wood",
    accords: [
      { name: "Cinnamon Spice", pct: 96 },
      { name: "Oak-Aged Cognac", pct: 92 },
      { name: "Praline & Vanilla", pct: 88 },
      { name: "French Oak", pct: 82 },
      { name: "Golden Amber", pct: 76 },
    ],
    architecture: {
      longevity: "10–14 Hours · Enveloping Warmth",
      sillage: "Strong · Intoxicating Trail",
      season: "Fall / Winter / Midnight Revelry",
      concentration: "EDP",
      profile: "An intoxicating splash of aged oak-barrel cognac chilled over frosted bergamot, leading to an opulent core of warm cinnamon bark and roasted hazelnut praline, grounded by sandalwood and golden amber.",
    },
    notes: {
      top: ["Cognac", "Cinnamon", "Frozen Bergamot", "Nutmeg"],
      heart: ["Oak", "Praline", "Tonka Bean", "Cardamom"],
      base: ["Vanilla", "Sandalwood", "Amber", "Cedarwood"],
    },
    image: "/images/angels-share.jpg",
    low_stock_threshold: 10,
    active: true,
    featured: true,
    sample_price: 99,
  },
  {
    slug: "side-effect",
    name: "Side Effect",
    order: 4,
    color: "#5A1420",
    badge: "The Enigma",
    tagline: "Tobacco, rum and dark leather after midnight.",
    story: "A dark, intoxicating trail of cured tobacco and vintage Jamaican rum that lingers long after you have left the room. Ignited by crimson saffron and wrapped in dark saddle leather, it is an enigmatic elixir of unrestrained passion and midnight temptation.",
    concentration: "Eau de Parfum",
    volume: "50 ml",
    price: 1499,
    stock: 50,
    olfactory_family: "Amber Tobacco · Dark Narcotic Leather",
    accords: [
      { name: "Rich Tobacco", pct: 96 },
      { name: "Dark Rum", pct: 92 },
      { name: "Warm Cinnamon", pct: 88 },
      { name: "Vanilla Absolute", pct: 82 },
      { name: "Leather & Saffron", pct: 78 },
    ],
    architecture: {
      longevity: "12+ Hours · Addictive Longevity",
      sillage: "Enormous · Room-Commanding",
      season: "Autumn / Winter / Intimate After-Hours",
      concentration: "EDP",
      profile: "A dangerously seductive duet of dark vintage rum and cured tobacco leaf ignited by cinnamon and crimson saffron threads, draped over an opulent base of dark saddle leather, woody amber and vanilla.",
    },
    notes: {
      top: ["Tobacco", "Rum", "Cinnamon", "Pink Pepper"],
      heart: ["Saffron", "Dried Fruits", "Cardamom"],
      base: ["Leather", "Vanilla", "Woody Amber", "Sandalwood", "Patchouli"],
    },
    image: "/images/side-effect.jpg",
    low_stock_threshold: 10,
    active: true,
    featured: true,
    sample_price: 99,
  },
];

const CACHE_KEY = "hotk_catalog_cache_v6";

export function getCachedCatalog() {
  if (typeof window === "undefined") return FALLBACK_PRODUCTS;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Quota or parse issue
  }
  return FALLBACK_PRODUCTS;
}

export function setCachedCatalog(products) {
  if (typeof window === "undefined") return;
  try {
    if (Array.isArray(products) && products.length > 0) {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(products));
    }
  } catch (e) {
    // Storage full or private browsing
  }
}

export function useProducts() {
  const q = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const res = await api.get("/products");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCachedCatalog(res.data);
          return res.data;
        }
        return getCachedCatalog();
      } catch (err) {
        return getCachedCatalog();
      }
    },
    initialData: () => getCachedCatalog(),
    staleTime: 1000 * 60 * 2,
  });

  const products = Array.isArray(q.data) && q.data.length ? q.data : getCachedCatalog();
  return { ...q, products };
}

export function useProduct(slug) {
  const cachedCatalog = getCachedCatalog();
  const fallback = cachedCatalog.find((p) => p.slug === slug) || FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  const q = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.data) {
          // If updated, sync into cached catalog
          const catalog = [...getCachedCatalog()];
          const idx = catalog.findIndex((p) => p.slug === slug);
          if (idx >= 0) {
            catalog[idx] = { ...catalog[idx], ...res.data };
          } else {
            catalog.push(res.data);
          }
          setCachedCatalog(catalog);
          return res.data;
        }
        return fallback;
      } catch (err) {
        return fallback;
      }
    },
    initialData: fallback,
    retry: 1,
  });
  return { ...q, data: q.data || fallback };
}
