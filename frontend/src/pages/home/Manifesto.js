import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrollWords, FadeUp } from "@/components/site/Reveal";

export function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bottleY = useTransform(scrollYProgress, [0, 0.5, 1], [120, 0, -100]);
  const bottleRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-10, 0, 8]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.45, 1], [0.85, 1.05, 0.95]);
  const auraScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.25, 0.85]);
  const bottleOpacity = useTransform(scrollYProgress, [0, 0.25, 0.8, 1], [0.3, 1, 1, 0.4]);

  return (
    <section ref={ref} className="relative mx-auto max-w-[1600px] px-5 py-28 sm:px-10 lg:py-44" data-testid="manifesto-section">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-center">
        {/* Left Column: The Manifesto Text */}
        <div className="lg:col-span-7">
          <p className="eyebrow">The House</p>
          <ScrollWords
            text="Our perfumes use real, serious ingredients like it's the 1400s. Resins, woods, spirits and spice — things with weight, not a chemistry set with a French name."
            className="display-md mt-6 max-w-[24ch] font-display"
          />
          <ScrollWords
            text="Spray it on before you walk in and act surprised when the room turns around."
            className="display-md mt-14 max-w-[22ch] font-display-italic text-gold"
          />
          <FadeUp className="mt-14 flex flex-wrap gap-4">
            <Link to="/collection" className="btn-royal" data-testid="manifesto-cta">Find your signature</Link>
            <Link to="/#best-sellers" className="btn-ghost-royal" data-testid="manifesto-armoury-cta">
              <span>Build a set</span>
            </Link>
          </FadeUp>
        </div>

        {/* Right Column: Floating Luxury Perfume Bottle with Parallax */}
        <div className="relative mt-8 flex items-center justify-center lg:mt-0 lg:col-span-5">
          {/* Ambient Warm Golden Aura */}
          <motion.div
            style={{ scale: auraScale }}
            className="pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-gold/20 blur-[90px] dark:bg-gold/30 sm:h-[420px] sm:w-[420px]"
            aria-hidden="true"
          />

          <motion.div
            style={{
              y: bottleY,
              rotate: bottleRotate,
              scale: bottleScale,
              opacity: bottleOpacity,
            }}
            className="relative flex flex-col items-center will-change-transform transform-gpu"
          >
            <Link
              to="/fragrance/blonde-amber"
              className="group relative block cursor-pointer transition-transform duration-700 hover:scale-105"
              aria-label="Discover Blonde Amber - Signature Extrait"
            >
              <img
                src="/images/cut-blonde-amber.png"
                alt="House signature bottle - Blonde Amber"
                loading="lazy"
                draggable={false}
                className="bottle-shadow h-[44svh] max-h-[580px] min-h-[360px] w-auto select-none object-contain transition-all duration-700 group-hover:brightness-105"
              />

              {/* Floating pill badge */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/70 bg-background/85 px-4 py-1.5 backdrop-blur-md shadow-lg transition-transform duration-500 group-hover:scale-105">
                <span className="flex items-center gap-2 text-[0.62rem] font-medium uppercase tracking-[0.28em] text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                  Blonde Amber · Extrait de Parfum
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
