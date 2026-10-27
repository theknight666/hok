import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Bottle } from "@/components/site/Bottle";
import { SplitChars, FadeUp, EASE } from "@/components/site/Reveal";
import { worldOf, featuredFirst } from "@/lib/visual";
import { inr, FREE_SHIPPING } from "@/lib/api";

const SLOTS = 4;

export function Armoury({ products: all }) {
  const products = featuredFirst(all).slice(0, 8);
  const { add } = useCart();
  const [picked, setPicked] = useState([]);
  const toggle = (slug) => setPicked((c) => (c.includes(slug) ? c.filter((s) => s !== slug) : c.length < SLOTS ? [...c, slug] : c));
  const chosen = picked.map((s) => products.find((p) => p.slug === s)).filter(Boolean);
  const total = chosen.reduce((s, p) => s + p.price, 0);
  const left = Math.max(0, FREE_SHIPPING - total);

  const addAll = () => {
    chosen.forEach((p) => add(p));
    toast.success(`${chosen.length} bottle${chosen.length > 1 ? "s" : ""} added to your bag`);
    setPicked([]);
  };

  return (
    <section className="relative mx-auto max-w-[1600px] px-5 pt-12 pb-24 sm:px-10 sm:pt-16 sm:pb-32 lg:pt-16 lg:pb-36" data-testid="armoury-section">
      <div id="best-sellers" className="pointer-events-none -mt-4 block h-0 w-full" />
      <span id="curate" className="pointer-events-none block h-0" />
      <span id="armoury" className="pointer-events-none block h-0" />
      <p className="eyebrow">Build your collection</p>
      <SplitChars text="One is a scent." className="display-lg mt-4 font-display" />
      <SplitChars text="Four is a reputation." className="display-lg font-display-italic text-gold" delay={0.25} />

      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-lg font-medium leading-snug text-muted-foreground">
            Pick from our current best sellers to curate your personal collection. Tap the bottles below to craft your signature set.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {products.map((p) => {
              const on = picked.includes(p.slug);
              const w = worldOf(p);
              return (
                <li key={p.slug}>
                  <button
                    onClick={() => toggle(p.slug)}
                    disabled={p.stock <= 0}
                    data-testid={`armoury-pick-${p.slug}`}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-2.5 sm:gap-4 rounded-full border-2 py-1.5 pl-1.5 pr-3 sm:py-2 sm:pl-2 sm:pr-5 text-left transition-all duration-400 disabled:opacity-40 ${on ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                  >
                    <span className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-full" style={{ background: w.bg }}>
                      <Bottle p={p} className="h-8 sm:h-10 w-auto" />
                    </span>
                    <span className="flex-1 font-display text-base leading-snug sm:text-2xl truncate">{p.name}</span>
                    <span className="text-xs sm:text-sm font-semibold tabular-nums shrink-0">{p.stock <= 0 ? "Sold out" : inr(p.price)}</span>
                    <span className={`grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-full border-2 ${on ? "border-background bg-background text-foreground" : "border-current"}`}>
                      {on ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <FadeUp className="lg:col-span-7">
          <div className="rounded-[1.75rem] sm:rounded-[2.5rem] bg-card p-4 sm:p-10 shadow-xl" data-testid="armoury-tray">
            <div className="grid grid-cols-4 gap-2 sm:gap-6">
              {Array.from({ length: SLOTS }).map((_, i) => {
                const p = chosen[i];
                const w = p ? worldOf(p) : null;
                return (
                  <div key={i} className="relative flex aspect-[3/4] items-end justify-center overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] border-2 border-dashed border-border" style={w ? { background: w.bg, borderColor: w.bg } : undefined} data-testid={`armoury-slot-${i}`}>
                    <AnimatePresence mode="popLayout">
                      {p ? (
                        <motion.div key={p.slug} initial={{ y: "100%", opacity: 0, rotate: -8 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: "100%", opacity: 0 }} transition={{ duration: 0.6, ease: EASE }} className="flex h-full items-center p-2 sm:p-3 will-change-transform transform-gpu">
                          <Bottle p={p} className="bottle-shadow max-h-full w-auto" />
                        </motion.div>
                      ) : (
                        <motion.span key="ghost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center font-display text-3xl sm:text-5xl text-border">
                          {i + 1}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col gap-5 border-t pt-6 sm:pt-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-muted-foreground">{chosen.length} of {SLOTS} chosen</p>
                <p className="mt-1 sm:mt-2 font-display text-4xl sm:text-5xl tabular-nums" data-testid="armoury-total">{inr(total)}</p>
                <p className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground" data-testid="armoury-shipping">
                  <Truck className="h-4 w-4 shrink-0" strokeWidth={2} />
                  {chosen.length === 0 ? "Pick a bottle to begin" : left > 0 ? `${inr(left)} away from free shipping` : "Free shipping unlocked"}
                </p>
              </div>
              <button disabled={!chosen.length} onClick={addAll} className="btn-royal w-full sm:w-auto disabled:opacity-40 disabled:hover:transform-none" data-testid="armoury-add-btn">
                Add {chosen.length || ""} to bag
              </button>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
