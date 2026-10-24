import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeUp, SplitChars } from "@/components/site/Reveal";

const REASONS = [
  {
    n: "01",
    t: "Molecular fidelity",
    d: "We map original olfactory pyramids with GC-MS chromatography, matching every top, heart, and base note with flawless precision. Indistinguishable in the air.",
  },
  {
    n: "02",
    t: "Zero luxury tax",
    d: "Designer houses charge ₹25,000 to fund Madison Avenue boutiques and supermodel campaigns. We cut the vanity markup and charge honestly for the fragrance itself.",
  },
  {
    n: "03",
    t: "Vanity-grade crystal",
    d: "Heavy faceted crystal flacons, solid metal knight crest caps, and pressurized ultra-fine mist atomizers built to command your dresser without apology.",
  },
];

export function Atelier() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const rot = useTransform(scrollYProgress, [0, 1], [-6, 3]);

  return (
    <section id="house" ref={ref} className="relative overflow-hidden bg-foreground text-background" data-testid="atelier-section">
      <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-10 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Heading and 4-Pillar Atelier Insights */}
          <div className="lg:col-span-7">
            <p className="eyebrow !text-gold">Why the House</p>
            <SplitChars text="Why House" className="display-lg mt-4 font-display" />
            <SplitChars text="of the Knight?" className="display-lg font-display-italic text-gold" delay={0.25} />
            <p className="mt-8 max-w-xl text-lg font-light leading-relaxed opacity-80 sm:text-xl">
              Because big-brand perfume smells like an airport. We make scent with character — the kind that gets remembered, quoted and occasionally borrowed without asking.
            </p>

            {/* Rich editorial insights filling the vertical negative space */}
            <div className="mt-12 grid grid-cols-1 gap-8 border-t border-background/15 pt-8 sm:grid-cols-2">
              <FadeUp delay={0.1}>
                <span className="text-[0.64rem] font-medium uppercase tracking-[0.28em] text-gold">The Formula</span>
                <h4 className="mt-2 font-display text-xl text-background">Chromatographic Fidelity</h4>
                <p className="mt-2 text-sm font-light leading-relaxed opacity-65">
                  Reverse-engineered using gas chromatography to mirror the exact molecular pyramid of grail fragrances with seamless precision.
                </p>
              </FadeUp>

              <FadeUp delay={0.2}>
                <span className="text-[0.64rem] font-medium uppercase tracking-[0.28em] text-gold">The Reality</span>
                <h4 className="mt-2 font-display text-xl text-background">Juice Over Billboards</h4>
                <p className="mt-2 text-sm font-light leading-relaxed opacity-65">
                  Traditional luxury spends 85% of your money on celebrity faces and prime department store rent. We invest solely in the bottle.
                </p>
              </FadeUp>

              <FadeUp delay={0.3}>
                <span className="text-[0.64rem] font-medium uppercase tracking-[0.28em] text-gold">The Performance</span>
                <h4 className="mt-2 font-display text-xl text-background">Past-Midnight Trail</h4>
                <p className="mt-2 text-sm font-light leading-relaxed opacity-65">
                  While modern reformulations water down iconic scents into faint skin scents, our formulas maintain loud, unapologetic presence.
                </p>
              </FadeUp>

              <FadeUp delay={0.4}>
                <span className="text-[0.64rem] font-medium uppercase tracking-[0.28em] text-gold">The Blend</span>
                <h4 className="mt-2 font-display text-xl text-background">Velvet Opening</h4>
                <p className="mt-2 text-sm font-light leading-relaxed opacity-65">
                  No harsh chemical alcohol sting. Every formulation is conditioned until the initial top spray opens as opulent as the deep drydown.
                </p>
              </FadeUp>
            </div>
          </div>

          {/* Right Column: Atelier Photo Card */}
          <div className="relative lg:col-span-5">
            <motion.div style={{ rotate: rot }} className="relative mx-auto w-[85%] overflow-hidden rounded-[2rem] bg-background p-3 shadow-2xl lg:w-full will-change-transform transform-gpu">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                <motion.img style={{ y, scale: 1.2 }} src="/images/atelier.jpg" alt="The perfumer's atelier" loading="lazy" className="absolute inset-0 h-full w-full object-cover will-change-transform transform-gpu" />
              </div>
              <p className="px-2 pb-1 pt-4 font-display text-xl text-foreground">The atelier, 2am. Candles optional, obsession mandatory.</p>
            </motion.div>
          </div>
        </div>

        {/* 3 Pillars: Differentiated Value Propositions */}
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
