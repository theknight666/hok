import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { Bottle } from "@/components/site/Bottle";
import { EASE, FadeUp } from "@/components/site/Reveal";
import { NotesPyramid } from "./home/NotesAtlas";
import { worldOf, worldVars } from "@/lib/visual";
import { inr } from "@/lib/api";

function StockLine({ p }) {
  if (p.stock <= 0) return <p className="text-sm font-semibold text-destructive" data-testid="stock-status">Currently sold out</p>;
  if (p.stock <= (p.low_stock_threshold ?? 10)) return <p className="text-sm font-semibold text-gold" data-testid="stock-status">Only {p.stock} left</p>;
  return <p className="text-sm font-semibold text-muted-foreground" data-testid="stock-status">In stock · ships in 24h</p>;
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
          <p className="font-display text-5xl">This fragrance could not be found.</p>
          <Link to="/" className="btn-royal mt-8">Return home</Link>
        </div>
      </main>
    );

  const world = worldOf(p);
  const others = products.filter((x) => x.slug !== p.slug);

  return (
    <main data-testid="product-page">
      <section style={worldVars(world)} className="grain relative overflow-hidden">
        <p aria-hidden="true" className="pointer-events-none absolute left-0 top-24 select-none whitespace-nowrap font-display text-[22vw] leading-none opacity-[0.12]">{p.name}</p>
        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-5 pb-16 pt-28 sm:px-10 lg:grid-cols-12 lg:pb-24">
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-28">
              <Link to="/#collection" className="pill border-2 border-current" data-testid="back-to-collection">
                <ArrowLeft className="h-4 w-4" strokeWidth={2.6} /> Collection
              </Link>
              <div className="relative mt-6 flex h-[56svh] items-center justify-center lg:h-[72svh]">
                <div className="world-glow pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2" />
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 120, rotate: -10 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 1.2, ease: EASE }}
                  className="animate-floaty relative"
                  style={{ "--tilt": "-3deg" }}
                >
                  <Bottle p={p} className="bottle-shadow h-[52svh] w-auto lg:h-[66svh]" />
                </motion.div>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }} className="rounded-[2.5rem] bg-background p-7 text-foreground shadow-2xl sm:p-10 lg:col-span-6 lg:p-14">
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill bg-foreground text-background">{p.badge}</span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{p.concentration} · {p.volume}</span>
            </div>
            <h1 className="display-lg mt-6 font-display">{p.name}</h1>
            <p className="mt-6 max-w-lg text-xl font-medium leading-snug text-muted-foreground">{p.tagline}</p>

            <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t pt-8">
              <span className="font-display text-5xl sm:text-6xl" data-testid="product-price">{inr(p.price)}</span>
              <StockLine p={p} />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center justify-between rounded-full border-2 px-2 py-1.5 sm:w-44">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} data-testid="qty-dec" aria-label="Decrease" className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-foreground hover:text-background"><Minus className="h-4 w-4" strokeWidth={2.6} /></button>
                <span className="font-display text-xl" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(Math.max(1, p.stock), q + 1))} data-testid="qty-inc" aria-label="Increase" className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-foreground hover:text-background"><Plus className="h-4 w-4" strokeWidth={2.6} /></button>
              </div>
              <button disabled={p.stock <= 0} onClick={() => add(p, qty)} className="btn-royal flex-1 disabled:opacity-50" data-testid="add-to-bag-btn">
                {p.stock <= 0 ? "Sold out" : `Add to bag · ${inr(p.price * qty)}`}
              </button>
            </div>

            <FadeUp className="mt-16">
              <p className="eyebrow">The Story</p>
              <p className="mt-4 font-display text-2xl leading-tight sm:text-3xl">{p.story}</p>
            </FadeUp>
            <FadeUp className="mt-14">
              <p className="eyebrow mb-6">The Composition</p>
              <NotesPyramid notes={p.notes} color={world.bg} />
            </FadeUp>
          </motion.div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-10 lg:py-32">
          <p className="eyebrow">Complete the armoury</p>
          <h2 className="display-md mt-4 font-display">The other three.</h2>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {others.map((o) => {
              const w = worldOf(o);
              return (
                <Link key={o.slug} to={`/fragrance/${o.slug}`} className="group block" data-testid={`related-${o.slug}`}>
                  <div style={worldVars(w)} className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-[2rem] p-6">
                    <span className="absolute left-5 top-5 pill border-2 border-current">{o.badge}</span>
                    <ArrowUpRight className="absolute right-5 top-5 h-6 w-6 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={2.4} />
                    <Bottle p={o} className="bottle-shadow h-[78%] w-auto transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-3 group-hover:rotate-[-4deg] group-hover:scale-105" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-4 px-2">
                    <span className="font-display text-2xl leading-none sm:text-3xl">{o.name}</span>
                    <span className="text-sm font-bold">{inr(o.price)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
