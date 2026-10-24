import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Bottle } from "@/components/site/Bottle";
import { EASE } from "@/components/site/Reveal";
import { worldOf } from "@/lib/visual";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/api";

const FALLBACK = [
  { slug: "blonde-amber", name: "Blonde Amber", price: 18500, image: "/images/blonde-amber.jpg", tagline: "Liquid gold, warm resins and a whisper of smoke." },
  { slug: "layton", name: "Layton", price: 16500, image: "/images/layton.jpg", tagline: "Crisp bergamot, lavender and warm woods." },
  { slug: "angels-share-on-the-rocks", name: "Angels Share On The Rocks", price: 17500, image: "/images/angels-share.jpg", tagline: "Cognac, cinnamon and oak — served over ice." },
  { slug: "side-effect", name: "Side Effect", price: 16000, image: "/images/side-effect.jpg", tagline: "Tobacco, rum and dark leather after midnight." },
];

const TILTS = [-7, 4, -3, 6];
const DEPTH = [1.2, 0.7, 1, 0.55];

function FloatingBottle({ p, i, active, onPick, mx, my }) {
  const x = useTransform(mx, (v) => v * 40 * DEPTH[i]);
  const y = useTransform(my, (v) => v * 26 * DEPTH[i]);
  return (
    <motion.button
      type="button"
      onClick={() => onPick(i)}
      data-testid={`hero-bottle-${p.slug}`}
      aria-label={`Select ${p.name}`}
      aria-pressed={active}
      style={{ zIndex: active ? 5 : 1 }}
      initial={{ opacity: 0, y: 160, rotate: TILTS[i] * 2 }}
      animate={{ opacity: 1, y: active ? -28 : 0, rotate: 0, scale: active ? 1.12 : 0.9 }}
      transition={{ duration: 1.1, ease: EASE, delay: 0.25 + i * 0.1 }}
      className="group relative origin-bottom px-1 focus:outline-none sm:px-2"
    >
      <motion.div style={{ x, y }}>
        <div className="animate-floaty" style={{ "--tilt": `${TILTS[i]}deg`, animationDelay: `${i * -1.4}s` }}>
          <Bottle p={p} className={`bottle-shadow h-[26svh] w-auto transition-[filter] duration-500 sm:h-[34svh] lg:h-[42svh] ${active ? "" : "brightness-[0.82] group-hover:brightness-100"}`} />
        </div>
      </motion.div>
    </motion.button>
  );
}

export function Hero({ products }) {
  const list = products.length ? products : FALLBACK;
  const [active, setActive] = useState(0);
  const cur = list[active] || list[0];
  const world = worldOf(cur);
  const { add } = useCart();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <motion.section
      onMouseMove={onMove}
      onMouseLeave={() => { rawX.set(0); rawY.set(0); }}
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
        transition={{ duration: 1.2 }}
        className="world-glow pointer-events-none absolute left-1/2 top-[55%] h-[70vw] w-[70vw] -translate-x-1/2 -translate-y-1/2"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 sm:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="flex flex-wrap items-center gap-3">
          <span className="pill border border-current">Extrait de Parfum</span>
          <span className="pill border border-current">Four signatures</span>
          <span className="hidden text-[0.66rem] font-normal uppercase tracking-[0.3em] opacity-70 sm:inline">Est. for people who enter rooms</span>
        </motion.div>

        <h1 className="hero-title mt-6 font-display" data-testid="hero-headline">
          {["Smell like", "you own", "the castle."].map((l, i) => (
            <span key={l} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
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

      <div className="relative z-20 mt-8 flex items-end justify-center lg:absolute lg:bottom-[15svh] lg:left-[48%] lg:right-[14%] lg:mt-0" data-testid="hero-bottle-stage">
        {list.map((p, i) => (
          <FloatingBottle key={p.slug} p={p} i={i} active={i === active} onPick={setActive} mx={mx} my={my} />
        ))}
      </div>

      <div className="relative z-10 mx-auto mt-auto flex w-full max-w-[1600px] flex-col gap-8 px-5 pb-8 pt-10 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9, ease: EASE }}>
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] opacity-70">Product n°0{active + 1} / 0{list.length}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {list.map((p, i) => (
              <li key={p.slug}>
                <button
                  onClick={() => setActive(i)}
                  data-testid={`hero-swatch-${p.slug}`}
                  aria-pressed={i === active}
                  className={`rounded-full border border-current px-5 py-2.5 font-display text-base leading-none transition-all duration-300 sm:text-lg ${i === active ? "bg-[var(--w-ink)] text-[var(--w-bg)]" : "opacity-60 hover:opacity-100"}`}
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.9, ease: EASE }}
          className="flex flex-wrap items-end gap-x-8 gap-y-4 lg:justify-end lg:text-right"
        >
          <div className="lg:max-w-[240px]">
            <p className="text-sm font-medium leading-snug opacity-80">{cur.tagline}</p>
            <p className="mt-1 font-display text-4xl" data-testid="hero-active-price">{inr(cur.price)}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => add(cur)} className="btn-world" data-testid="hero-shop-btn">
              Add to bag
            </button>
            <Link to={`/fragrance/${cur.slug}`} className="btn-world-ghost" data-testid="hero-discover-active">
              Discover <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
