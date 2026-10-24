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
  const by = useTransform(scrollYProgress, [0, 0.5, 1], ["22%", "0%", "-12%"]);
  const ghostX = useTransform(scrollYProgress, [0, 1], ["6%", "-10%"]);
  const world = worldOf(p);
  const sold = p.stock <= 0;
  const notes = flatNotes(p.notes, 5);

  return (
    <div ref={ref} className="h-[115svh]" data-testid={`product-card-${p.slug}`}>
      <article
        style={{ ...worldVars(world), zIndex: idx + 1 }}
        className="grain sticky top-0 flex h-[100svh] flex-col overflow-hidden rounded-t-[2.5rem] shadow-[0_-30px_80px_-30px_rgba(0,0,0,0.45)]"
      >
        <motion.p
          style={{ x: ghostX }}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-[16%] select-none whitespace-nowrap font-display text-[15vw] leading-none opacity-[0.1]"
        >
          {p.name}
        </motion.p>

        <div className="relative mx-auto grid h-full w-full max-w-[1600px] grid-cols-1 gap-6 px-5 pb-8 pt-24 sm:px-10 lg:grid-cols-12 lg:pb-12">
          <div className="z-10 flex flex-col justify-end lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="pill border border-current">{p.badge || "Signature"}</span>
              <span className="text-[0.66rem] font-medium uppercase tracking-[0.3em] opacity-70">0{idx + 1} / 0{total}</span>
            </div>
            <h3 className="display-lg mt-6 font-display">{p.name}</h3>
            <p className="mt-5 max-w-sm text-base font-medium leading-snug opacity-85 sm:text-lg">{p.tagline}</p>
            <ul className="mt-6 flex flex-wrap gap-2" data-testid={`chapter-notes-${p.slug}`}>
              {notes.map((n) => (
                <li key={n} className="rounded-full border border-current/40 px-3 py-1 text-xs font-semibold">{n}</li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 flex items-center justify-center lg:col-span-4">
            <div className="world-glow pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[90%] -translate-x-1/2 -translate-y-1/2" />
            <motion.div style={{ rotate, y: by }} className="relative">
              <Link to={`/fragrance/${p.slug}`} aria-label={`Open ${p.name}`}>
                <Bottle p={p} className="bottle-shadow h-[38svh] w-auto transition-transform duration-700 hover:scale-105 sm:h-[48svh] lg:h-[66svh]" />
              </Link>
            </motion.div>
          </div>

          <div className="z-10 flex flex-col justify-end gap-6 lg:col-span-4 lg:items-end lg:text-right">
            <div>
              <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] opacity-70">{p.concentration} · {p.volume}</p>
              <p className="mt-2 font-display text-5xl sm:text-6xl" data-testid={`product-price-${p.slug}`}>{inr(p.price)}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button disabled={sold} onClick={() => add(p)} className="btn-world disabled:opacity-50" data-testid={`quick-add-${p.slug}`}>
                {sold ? "Sold out" : (<><Plus className="h-4 w-4" strokeWidth={2.6} /> Add to bag</>)}
              </button>
              <Link to={`/fragrance/${p.slug}`} className="btn-world-ghost" data-testid={`view-product-${p.slug}`}>
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
