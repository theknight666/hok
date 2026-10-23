import { lazy, Suspense, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { MaskLines, EASE, FadeUp } from "@/components/site/Reveal";
import { NotesPyramid } from "./home/NotesAtlas";
import { inr } from "@/lib/api";

const BottleScene = lazy(() => import("@/components/site/BottleScene"));

function StockLine({ p }) {
  if (p.stock <= 0) return <p className="text-sm text-destructive" data-testid="stock-status">Currently sold out</p>;
  if (p.stock <= (p.low_stock_threshold ?? 10)) return <p className="text-sm text-gold" data-testid="stock-status">Only {p.stock} left</p>;
  return <p className="text-sm text-muted-foreground" data-testid="stock-status">In stock · ready to dispatch</p>;
}

export default function Product() {
  const { slug } = useParams();
  const { data: p, isLoading, isError } = useProduct(slug);
  const { products } = useProducts();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  if (isLoading) return <div className="min-h-screen" />;
  if (isError || !p)
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="font-display text-4xl">This fragrance could not be found.</p>
          <Link to="/" className="btn-ghost-royal mt-8">Return home</Link>
        </div>
      </main>
    );

  const others = products.filter((x) => x.slug !== p.slug);

  return (
    <main className="pt-[72px]" data-testid="product-page">
      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-2">
        <div className="relative h-[62svh] lg:sticky lg:top-[72px] lg:h-[calc(100svh-72px)]">
          <div className="spotlight absolute inset-0" />
          <div className="absolute inset-0 opacity-[0.08]" style={{ background: `radial-gradient(circle at 50% 50%, ${p.color}, transparent 60%)` }} />
          <Suspense fallback={null}>
            <BottleScene color={p.color} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
          </Suspense>
          <Link to="/#collection" className="absolute left-5 top-6 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.3em] hover:text-gold sm:left-10" data-testid="back-to-collection">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.3} /> Collection
          </Link>
        </div>

        <div className="px-5 pb-24 pt-10 sm:px-10 lg:px-16 lg:pt-24">
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {p.badge} · {p.concentration}
          </motion.p>
          <MaskLines key={p.slug} lines={[p.name]} delay={0.1} className="mt-5 font-display text-5xl font-light leading-[0.95] sm:text-6xl lg:text-7xl" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1, ease: EASE }}>
            <p className="mt-6 max-w-lg font-display text-2xl italic leading-snug text-muted-foreground">{p.tagline}</p>
            <div className="mt-10 flex items-baseline justify-between border-y py-6">
              <span className="font-display text-4xl" data-testid="product-price">{inr(p.price)}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{p.volume}</span>
            </div>
            <div className="mt-6"><StockLine p={p} /></div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="flex items-center justify-between border px-5 py-4 sm:w-40">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} data-testid="qty-dec" aria-label="Decrease" className="hover:text-gold"><Minus className="h-4 w-4" /></button>
                <span data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(Math.max(1, p.stock), q + 1))} data-testid="qty-inc" aria-label="Increase" className="hover:text-gold"><Plus className="h-4 w-4" /></button>
              </div>
              <button disabled={p.stock <= 0} onClick={() => add(p, qty)} className="btn-royal flex-1 disabled:opacity-50" data-testid="add-to-bag-btn">
                <span>{p.stock <= 0 ? "Sold out" : "Add to bag"}</span>
              </button>
            </div>
          </motion.div>

          <FadeUp className="mt-20">
            <p className="eyebrow">The Story</p>
            <p className="mt-5 font-display text-3xl font-light leading-snug">{p.story}</p>
          </FadeUp>
          <FadeUp className="mt-16">
            <p className="eyebrow mb-6">The Composition</p>
            <NotesPyramid notes={p.notes} color={p.color} />
          </FadeUp>
          <FadeUp className="mt-16">
            <div className="relative aspect-[4/5] overflow-hidden bg-card">
              <img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </FadeUp>
        </div>
      </div>

      {others.length > 0 && (
        <section className="border-t">
          <div className="mx-auto max-w-[1500px] px-5 py-24 sm:px-10">
            <p className="eyebrow">Complete the armoury</p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {others.map((o) => (
                <Link key={o.slug} to={`/fragrance/${o.slug}`} className="group block" data-testid={`related-${o.slug}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-card">
                    <img src={o.image} alt={o.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="font-display text-2xl">{o.name}</span>
                    <span className="text-sm text-muted-foreground">{inr(o.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
