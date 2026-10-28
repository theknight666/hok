import { useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { Bottle } from "@/components/site/Bottle";
import { EASE, FadeUp } from "@/components/site/Reveal";
import { NotesPyramid } from "./home/NotesAtlas";
import { ReviewsBlock } from "@/components/site/ReviewsBlock";
import { worldOf, worldVars, featuredFirst, isValidImageUrl, defaultCutoutOf, defaultPhotoOf } from "@/lib/visual";
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
  const [size, setSize] = useState("50 ml");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const galleryRef = useRef(null);

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
  const others = featuredFirst(products.filter((x) => x.slug !== p.slug)).slice(0, 3);
  const samplePrice = p.sample_price || 99;
  const currentPrice = size === "2 ml" ? samplePrice : p.price;
  const isSoldOut = size === "50 ml" && p.stock <= 0;

  const defaultCut = defaultCutoutOf(p.slug);
  const defaultPhoto = defaultPhotoOf(p.slug);

  // Filter gallery strictly to valid image URLs, with guaranteed fallback to authentic catalog cutouts
  const rawImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
  const validImages = Array.from(new Set(rawImages.filter(isValidImageUrl)));
  const gallery = validImages.length > 0 ? validImages : [defaultCut, defaultPhoto].filter(Boolean);
  const activeImage = gallery[selectedIdx] || gallery[0] || defaultCut;

  return (
    <main data-testid="product-page" className="w-full max-w-full overflow-x-hidden">
      <section style={worldVars(world)} className="grain relative overflow-hidden transform-gpu w-full max-w-full">
        <p aria-hidden="true" className="pointer-events-none absolute left-0 top-24 select-none whitespace-nowrap font-display text-[13vw] leading-none opacity-[0.1] will-change-transform max-w-full overflow-hidden truncate">{p.name}</p>
        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-5 pb-16 pt-28 sm:px-10 lg:grid-cols-12 lg:pb-24 w-full min-w-0 max-w-full">
          <div className="min-w-0 w-full max-w-full lg:col-span-6">
            <div className="lg:sticky lg:top-24">
              <Link to="/#collection" className="pill border border-current" data-testid="back-to-collection">
                <ArrowLeft className="h-4 w-4" strokeWidth={2.6} /> Collection
              </Link>

              {/* Upper Main Stage (Shows active image floating cleanly without any background cube) */}
              <div className="relative mt-4 sm:mt-6 flex h-[48svh] items-center justify-center lg:h-[62svh]">
                <div className="world-glow pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 will-change-transform" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.94, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="animate-floaty relative will-change-transform transform-gpu flex items-center justify-center h-full w-full"
                    style={{ "--tilt": "-3deg" }}
                  >
                    <img
                      src={activeImage}
                      alt={`${p.name} - View ${selectedIdx + 1}`}
                      className="bottle-shadow h-[46svh] w-auto lg:h-[58svh] max-w-full select-none object-contain"
                      draggable={false}
                      onError={(e) => {
                        if (e.currentTarget.src !== defaultCut) {
                          e.currentTarget.src = defaultCut;
                        }
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Red-Marked Area: Premium Squircle Cubes Gallery Strip */}
              {gallery.length > 1 && (
                <div className="mt-4 flex flex-col items-center w-full" data-testid="product-squircle-gallery">
                  <div className="relative flex w-full max-w-full items-center justify-center">
                    {gallery.length > 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (galleryRef.current) galleryRef.current.scrollBy({ left: -140, behavior: "smooth" });
                        }}
                        className="hidden sm:grid absolute -left-3 z-10 h-8 w-8 place-items-center rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-black/90 transition-colors cursor-pointer"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}

                    <div
                      ref={galleryRef}
                      className="flex items-center gap-3 overflow-x-auto py-2 px-2 no-scrollbar scroll-smooth max-w-full justify-start sm:justify-center"
                    >
                      {gallery.map((imgUrl, idx) => {
                        const isActive = idx === selectedIdx;
                        return (
                          <button
                            key={imgUrl + idx}
                            type="button"
                            onClick={() => setSelectedIdx(idx)}
                            className={`group relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 aspect-square rounded-2xl overflow-hidden transition-all duration-300 transform-gpu cursor-pointer p-1.5 flex items-center justify-center ${
                              isActive
                                ? "border-2 border-gold bg-gold/15 shadow-[0_0_22px_rgba(212,175,55,0.45)] scale-105 z-10 ring-1 ring-gold"
                                : "border border-white/20 hover:border-white/50 bg-black/30 hover:bg-black/50 opacity-70 hover:opacity-100 hover:scale-105"
                            }`}
                            aria-label={`View photo ${idx + 1}`}
                            data-testid={`squircle-thumb-${idx}`}
                          >
                            <img
                              src={imgUrl}
                              alt=""
                              className="h-full w-full object-contain rounded-xl select-none transition-transform duration-300 group-hover:scale-110"
                              draggable={false}
                              onError={(e) => {
                                if (e.currentTarget.src !== defaultCut) {
                                  e.currentTarget.src = defaultCut;
                                }
                              }}
                            />
                            {isActive && (
                              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-gold shadow-[0_0_6px_#D4AF37]" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {gallery.length > 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (galleryRef.current) galleryRef.current.scrollBy({ left: 140, behavior: "smooth" });
                        }}
                        className="hidden sm:grid absolute -right-3 z-10 h-8 w-8 place-items-center rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-black/90 transition-colors cursor-pointer"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/70 mt-2 font-mono">
                    {selectedIdx + 1} / {gallery.length} Views
                  </span>
                </div>
              )}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }} className="min-w-0 w-full max-w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-background p-5 sm:p-10 text-foreground shadow-2xl lg:col-span-6 lg:p-14">
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill bg-foreground text-background">{p.badge}</span>
              <span className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-muted-foreground">{p.concentration} · {size}</span>
            </div>
            <h1 className="mt-3 sm:mt-6 font-display text-3xl sm:text-5xl lg:text-7xl leading-[0.95] break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full">{p.name}</h1>
            <p className="mt-4 sm:mt-6 max-w-lg text-base sm:text-xl font-medium leading-snug text-muted-foreground break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full">{p.tagline}</p>

            {/* Volume / Size Selector */}
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="eyebrow text-xs">Choose Size</span>
                <span className="text-xs text-muted-foreground">{size === "2 ml" ? "Discovery Sample Vial" : "Signature Flacon"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3" data-testid="size-selector">
                <button
                  type="button"
                  onClick={() => setSize("50 ml")}
                  data-testid="size-50ml"
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left ${
                    size === "50 ml"
                      ? "border-gold bg-gold/10 text-foreground shadow-sm"
                      : "border-border/60 hover:border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-display text-lg">50 ml</span>
                  <span className="text-xs opacity-70">Signature Bottle</span>
                  <span className="mt-2 font-bold text-foreground text-sm">{inr(p.price)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSize("2 ml")}
                  data-testid="size-2ml"
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left ${
                    size === "2 ml"
                      ? "border-gold bg-gold/10 text-foreground shadow-sm"
                      : "border-border/60 hover:border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display text-lg">2 ml</span>
                    <span className="text-[10px] uppercase tracking-wider bg-gold text-background px-1.5 py-0.5 rounded font-semibold">Sample</span>
                  </div>
                  <span className="text-xs opacity-70">Discovery Vial</span>
                  <span className="mt-2 font-bold text-foreground text-sm">{inr(samplePrice)}</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t pt-6">
              <span className="font-display text-4xl sm:text-6xl tabular-nums shrink-0" data-testid="product-price">{inr(currentPrice)}</span>
              {size === "50 ml" ? <StockLine p={p} /> : <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">In stock · Ready to dispatch</span>}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center justify-between rounded-full border-2 px-2 py-1.5 sm:w-44">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} data-testid="qty-dec" aria-label="Decrease" className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-foreground hover:text-background"><Minus className="h-4 w-4" strokeWidth={2.6} /></button>
                <span className="font-display text-xl" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(20, q + 1))} data-testid="qty-inc" aria-label="Increase" className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-foreground hover:text-background"><Plus className="h-4 w-4" strokeWidth={2.6} /></button>
              </div>
              <button disabled={isSoldOut} onClick={() => add(p, qty, size)} className="btn-royal flex-1 disabled:opacity-50" data-testid="add-to-bag-btn">
                {isSoldOut ? "Sold out" : `Add to bag · ${inr(currentPrice * qty)}`}
              </button>
            </div>

            <FadeUp className="mt-16 min-w-0 w-full max-w-full overflow-hidden">
              <p className="eyebrow">The Story</p>
              <p className="mt-4 font-display text-xl sm:text-2xl lg:text-3xl leading-snug sm:leading-tight break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full whitespace-pre-line">{p.story}</p>
            </FadeUp>
            <FadeUp className="mt-14 min-w-0 w-full max-w-full overflow-hidden">
              <p className="eyebrow mb-6">The Composition</p>
              <NotesPyramid notes={p.notes} color={world.bg} product={p} />
            </FadeUp>
            <ReviewsBlock slug={p.slug} name={p.name} />
          </motion.div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-10 lg:py-32">
          <p className="eyebrow">Continue exploring</p>
          <div className="flex flex-wrap items-end justify-between gap-6"><h2 className="display-md mt-4 font-display">More from the House.</h2><Link to="/collection" className="btn-ghost-royal" data-testid="related-view-all"><span>All fragrances</span></Link></div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {others.map((o) => {
              const w = worldOf(o);
              return (
                <Link key={o.slug} to={`/fragrance/${o.slug}`} className="group block" data-testid={`related-${o.slug}`}>
                  <div style={worldVars(w)} className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-[2rem] p-6">
                    <span className="absolute left-5 top-5 pill border border-current">{o.badge}</span>
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
