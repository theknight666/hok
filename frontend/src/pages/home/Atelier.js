import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeUp, SplitChars } from "@/components/site/Reveal";

const REASONS = [
  { n: "01", t: "Small batches", d: "Short runs, long macerations. Every batch is nosed by hand before it earns the crest — no conveyor belts, no compromises." },
  { n: "02", t: "Extrait strength", d: "Up to 30% concentration. One spray in the morning, still getting compliments at the afterparty." },
  { n: "03", t: "Oh, this?", d: "Gilded caps, faceted crystal, a heraldic crest on every bottle. The dresser upgrade nobody asked for and everybody notices." },
];

export function Atelier() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const rot = useTransform(scrollYProgress, [0, 1], [-6, 3]);

  return (
    <section id="house" ref={ref} className="relative overflow-hidden bg-foreground text-background" data-testid="atelier-section">
      <div className="mx-auto max-w-[1600px] px-5 py-28 sm:px-10 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">Why the House</p>
            <SplitChars text="Why House" className="display-lg mt-4 font-display" />
            <SplitChars text="of the Knight?" className="display-lg font-display-italic text-gold" delay={0.25} />
            <p className="mt-8 max-w-md text-lg font-medium leading-snug opacity-70">
              Because big-brand perfume smells like an airport. We make scent with character — the kind that gets remembered, quoted and occasionally borrowed without asking.
            </p>
          </div>
          <div className="relative lg:col-span-5">
            <motion.div style={{ rotate: rot }} className="relative mx-auto w-[80%] overflow-hidden rounded-[2rem] bg-background p-3 shadow-2xl lg:w-full">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                <motion.img style={{ y, scale: 1.2 }} src="/images/atelier.jpg" alt="The perfumer's atelier" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <p className="px-2 pb-1 pt-4 font-display text-xl text-foreground">The atelier, 2am. Candles optional, obsession mandatory.</p>
            </motion.div>
          </div>
        </div>

        <div className="mt-24 grid gap-6 lg:grid-cols-3">
          {REASONS.map((r, i) => (
            <FadeUp key={r.n} delay={i * 0.1} className="rounded-[2rem] border border-background/15 p-8 transition-colors duration-500 hover:border-gold lg:p-10">
              <span className="font-display text-6xl text-gold">{r.n}</span>
              <h3 className="mt-8 font-display text-3xl sm:text-4xl">{r.t}</h3>
              <p className="mt-4 text-base leading-relaxed opacity-70">{r.d}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
