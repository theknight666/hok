import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Bottle } from "@/components/site/Bottle";
import { SplitChars, EASE } from "@/components/site/Reveal";
import { worldOf, worldVars, flatNotes } from "@/lib/visual";
import { inr } from "@/lib/api";

function Chapter({ p, idx, total }) {
  const { add } = useCart();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-14, 0, 10]);
  const by = useTransform(scrollYProgress, (v) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (isMobile) {
      // Subtle bounded float on mobile to guarantee zero overlap with price or text
      const progress = Math.min(1, Math.max(0, v));
      const pct = (0.5 - progress) * 8; // -4% to +4%
      return `${pct}%`;
    }
    // Desktop luxury motion
    if (v <= 0.5) {
      const t = v / 0.5;
      return `${22 - t * 22}%`;
    } else {
      const t = (v - 0.5) / 0.5;
      return `${0 - t * 12}%`;
    }
  });
  const ghostX = useTransform(scrollYProgress, [0, 1], ["6%", "-10%"]);
  const world = worldOf(p);
  const sold = p.stock <= 0;
  const notes = flatNotes(p.notes, 5);

  return (
    <div ref={ref} className="h-[110svh] sm:h-[115svh]" data-testid={`product-card-${p.slug}`}>
      <article
        style={{ ...worldVars(world), zIndex: idx + 1 }}
        className="grain sticky top-0 flex h-[100svh] flex-col overflow-hidden rounded-t-[2.5rem] shadow-[0_-30px_80px_-30px_rgba(0,0,0,0.45)] transform-gpu"
      >
        <motion.p
          style={{ x: ghostX }}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-[16%] select-none whitespace-nowrap font-display text-[15vw] leading-none opacity-[0.1] will-change-transform"
        >
          {p.name}
        </motion.p>

        <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col justify-between px-5 pb-6 pt-20 sm:px-10 sm:pb-8 sm:pt-24 lg:grid lg:grid-cols-12 lg:gap-6 lg:pb-12">
          {/* Column 1: Header / Details */}
          <div className="z-10 flex flex-col justify-end lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="pill border border-current text-[0.62rem] py-0.5 px-2.5 sm:text-xs sm:py-1 sm:px-3">{p.badge || "Signature"}</span>
              <span className="text-[0.62rem] font-medium uppercase tracking-[0.25em] opacity-70 sm:text-[0.66rem] sm:tracking-[0.3em]">0{idx + 1} / 0{total}</span>
            </div>
            <h3 className="mt-2 font-display text-3xl leading-[0.95] sm:mt-4 sm:text-4xl lg:mt-6 lg:display-lg">{p.name}</h3>
            <p className="mt-2 max-w-sm text-xs font-medium leading-snug opacity-85 sm:mt-4 sm:text-base lg:mt-5 lg:text-lg line-clamp-2 lg:line-clamp-none">{p.tagline}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2 lg:mt-6" data-testid={`chapter-notes-${p.slug}`}>
              {notes.map((n, ni) => (
                <li key={n} className={`rounded-full border border-current/40 px-2.5 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${ni >= 3 ? "hidden sm:inline-block" : ""}`}>{n}</li>
              ))}
            </ul>
          </div>

          {/* Column 2: Bottle Flacon Stage */}
          <div className="relative z-10 flex items-center justify-center my-auto py-1 sm:py-2 lg:my-0 lg:py-0 lg:col-span-4">
            <div className="world-glow pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-[85%] -translate-x-1/2 -translate-y-1/2" />
            <motion.div style={{ rotate, y: by }} className="relative will-change-transform transform-gpu">
              <Link to={`/fragrance/${p.slug}`} aria-label={`Open ${p.name}`}>
                <Bottle p={p} className="bottle-shadow h-[25svh] sm:h-[36svh] lg:h-[66svh] w-auto transition-transform duration-700 hover:scale-105" />
              </Link>
            </motion.div>
          </div>

          {/* Column 3: Pricing & Actions */}
          <div className="z-10 flex flex-col justify-end gap-3 sm:gap-5 lg:gap-6 lg:col-span-4 lg:items-end lg:text-right">
            <div>
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.25em] opacity-70 sm:text-[0.66rem] sm:tracking-[0.3em]">{p.concentration} · {p.volume}</p>
              <p className="mt-1 font-display text-3xl sm:mt-2 sm:text-4xl lg:text-6xl tabular-nums leading-none" data-testid={`product-price-${p.slug}`}>{inr(p.price)}</p>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3 lg:justify-end">
              <button disabled={sold} onClick={() => add(p)} className="btn-world flex-1 sm:flex-initial py-2.5 px-5 sm:py-4 sm:px-8 text-xs justify-center disabled:opacity-50" data-testid={`quick-add-${p.slug}`}>
                {sold ? "Sold out" : (<><Plus className="h-4 w-4" strokeWidth={2.6} /> Add to bag</>)}
              </button>
              <Link to={`/fragrance/${p.slug}`} className="btn-world-ghost py-2.5 px-4 sm:py-4 sm:px-8 text-xs justify-center shrink-0" data-testid={`view-product-${p.slug}`}>
                View <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function Collection({ products }) {
  if (!products.length) return null;
  return (
    <section id="signatures" className="relative" data-testid="collection-section">
      <div className="mx-auto max-w-[1600px] px-5 pb-16 pt-28 sm:px-10 lg:pb-24 lg:pt-40">
        <p className="eyebrow">House Signatures</p>
        <SplitChars text="The ones" className="display-xl mt-4 font-display" />
        <SplitChars text="they ask about." className="display-xl font-display-italic text-gold" delay={0.3} />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          className="mt-8 max-w-xl text-lg font-medium leading-snug text-muted-foreground"
        >
          The signatures of the season — the bottles that get stopped in corridors. Each is built to be noticed from across the hall.
        </motion.p>
      </div>
      <div className="relative">
        {products.map((p, i) => (
          <Chapter key={p.slug} p={p} idx={i} total={products.length} />
        ))}
      </div>
    </section>
  );
}
