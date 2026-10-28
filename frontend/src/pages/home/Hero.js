import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Bottle } from "@/components/site/Bottle";
import { EASE } from "@/components/site/Reveal";
import { worldOf } from "@/lib/visual";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/api";
import { FALLBACK_PRODUCTS } from "@/hooks/useProducts";

const FALLBACK = FALLBACK_PRODUCTS;

/** Signed distance from the active index around the ring, e.g. -2,-1,0,1 for n=4. */
const ringOffset = (i, active, n) => ((i - active + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);

function Formation({ list, active, onPick }) {
  const n = list.length;
  return (
    <div className="relative h-[46svh] w-full sm:h-[52svh] lg:h-[60svh]" data-testid="hero-bottle-stage">
      {list.map((p, i) => {
        const off = ringOffset(i, active, n);
        const a = Math.abs(off);
        const isActive = off === 0;
        return (
          <motion.button
            key={p.slug}
            type="button"
            onClick={() => onPick(i)}
            data-testid={`hero-bottle-${p.slug}`}
            aria-label={`Show ${p.name}`}
            aria-pressed={isActive}
            className="absolute bottom-0 left-1/2 origin-bottom focus:outline-none will-change-transform transform-gpu"
            initial={false}
            animate={{
              x: `calc(-50% + ${off * 8}vw)`,
              y: `${-a * 6}%`,
              scale: isActive ? 1 : a === 1 ? 0.74 : 0.58,
              zIndex: 10 - a,
              opacity: isActive ? 1 : Math.max(0.48, 0.68 - a * 0.1),
            }}
            transition={{ duration: 0.85, ease: EASE }}
          >
            <Bottle p={p} className="bottle-shadow h-[40svh] w-auto sm:h-[46svh] lg:h-[54svh]" />
          </motion.button>
        );
      })}
    </div>
  );
}

export function Hero({ products }) {
  const featured = products.filter((p) => p.featured);
  const list = featured.length ? featured : products.length ? products : FALLBACK;
  const [active, setActive] = useState(0);
  const cur = list[active % list.length] || list[0];
  const world = worldOf(cur);
  const { add } = useCart();
  const step = (d) => setActive((a) => (a + d + list.length) % list.length);

  return (
    <motion.section
      id="hero"
      animate={{ backgroundColor: world.bg, color: world.ink }}
      transition={{ duration: 0.9, ease: EASE }}
      style={{ "--w-bg": world.bg, "--w-ink": world.ink, "--w-soft": world.soft }}
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden pt-24"
      data-testid="hero-section"
    >
      <motion.div
        key={cur.slug}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="world-glow pointer-events-none absolute left-1/2 top-[58%] h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 sm:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="flex flex-wrap items-center gap-3">
          <span className="pill border border-current">Eau de Parfum</span>
        </motion.div>

        <h1 className="hero-title mt-6 max-w-[14ch] font-display" data-testid="hero-headline">
          {["Smell like", "you own", "the room."].map((l, i) => (
            <span key={l} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
              <motion.span
                className={`block ${i === 2 ? "font-display-italic" : ""}`}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.35 + i * 0.1 }}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </h1>
      </div>

      <div className="relative z-10 mx-auto mt-4 w-full max-w-[1600px] px-5 sm:px-10 lg:absolute lg:bottom-[17svh] lg:left-[68%] lg:mt-0 lg:w-[56%] lg:-translate-x-1/2 lg:px-0">
        <div className="relative">
          <Formation list={list} active={active % list.length} onPick={setActive} />
        </div>
      </div>

      <div className="relative z-30 mx-auto mt-auto flex w-full max-w-[1600px] flex-col gap-6 px-5 pb-8 pt-8 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9, ease: EASE }} className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <div className="flex items-center gap-4">
          <button onClick={() => step(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-current transition-colors duration-300 hover:bg-[var(--w-ink)] hover:text-[var(--w-bg)]" aria-label="Previous fragrance" data-testid="hero-prev">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <div className="min-w-[8ch] text-center">
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] opacity-70">N°</p>
            <p className="font-display text-xl leading-none" data-testid="hero-counter">0{(active % list.length) + 1} / 0{list.length}</p>
          </div>
          <button onClick={() => step(1)} className="grid h-12 w-12 place-items-center rounded-full border border-current transition-colors duration-300 hover:bg-[var(--w-ink)] hover:text-[var(--w-bg)]" aria-label="Next fragrance" data-testid="hero-next">
            <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
          </button>
          </div>
          <div className="max-w-[320px]">
            <AnimatePresence mode="wait">
              <motion.div key={cur.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
                <p className="font-display text-xl sm:text-2xl break-words [overflow-wrap:anywhere]" data-testid="hero-active-name">{cur.name}</p>
                <p className="mt-1 text-sm font-light leading-snug opacity-80 break-words [overflow-wrap:anywhere]">{cur.tagline}</p>
              </motion.div>
            </AnimatePresence>

          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.9, ease: EASE }} className="flex flex-wrap items-center justify-between sm:justify-start gap-x-6 gap-y-3 lg:justify-end">
          <p className="font-display text-2xl sm:text-3xl shrink-0 tabular-nums" data-testid="hero-active-price">{inr(cur.price)}</p>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button onClick={() => add(cur)} className="btn-world" data-testid="hero-shop-btn">Add to bag</button>
            <Link to={`/fragrance/${cur.slug}`} className="btn-world-ghost" data-testid="hero-discover-active">
              Discover <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
