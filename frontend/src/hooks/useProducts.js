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
    story: "A radiant amber that glows like candlelight on gilded walls — warm, golden and unmistakably regal.",
    concentration: "Extrait de Parfum",
    volume: "50 ml",
    price: 1599,
    stock: 44,
    notes: {
      top: ["Bitter Orange", "Pink Pepper"],
      heart: ["Blonde Tobacco", "Orris"],
      base: ["Amber", "Tonka", "Vanilla"],
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
    story: "Composed with the poise of a knight in court — fresh at first, then deep, warm and assured.",
    concentration: "Eau de Parfum",
    volume: "50 ml",
    price: 1499,
    stock: 50,
    notes: {
      top: ["Apple", "Bergamot", "Lavender"],
      heart: ["Jasmine", "Violet"],
      base: ["Vanilla", "Sandalwood", "Guaiac Wood"],
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
    story: "An ode to the spirit lost to the heavens as cognac ages in oak, poured cold over crystal ice.",
    concentration: "Extrait de Parfum",
    volume: "50 ml",
    price: 1549,
    stock: 50,
    notes: {
      top: ["Cognac", "Frozen Bergamot"],
      heart: ["Cinnamon", "Oak"],
      base: ["Praline", "Sandalwood", "Vanilla"],
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
    story: "A dark, addictive trail of tobacco and rum that lingers long after you have left the room.",
    concentration: "Eau de Parfum",
    volume: "50 ml",
    price: 1499,
    stock: 50,
    notes: {
      top: ["Rum", "Tobacco"],
      heart: ["Cinnamon", "Saffron"],
      base: ["Leather", "Vanilla", "Woody Amber"],
    },
    image: "/images/side-effect.jpg",
    low_stock_threshold: 10,
    active: true,
    featured: true,
    sample_price: 99,
  },
];

export function useProducts() {
  const q = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const res = await api.get("/products");
        return Array.isArray(res.data) && res.data.length ? res.data : FALLBACK_PRODUCTS;
      } catch (err) {
        return FALLBACK_PRODUCTS;
      }
    },
    initialData: FALLBACK_PRODUCTS,
    staleTime: 1000 * 60 * 2,
  });

  const products = Array.isArray(q.data) && q.data.length ? q.data : FALLBACK_PRODUCTS;
  return { ...q, products };
}

export function useProduct(slug) {
  const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  const q = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        return res.data || fallback;
      } catch (err) {
        return fallback;
      }
    },
    initialData: fallback,
    retry: 1,
  });
  return { ...q, data: q.data || fallback };
}
