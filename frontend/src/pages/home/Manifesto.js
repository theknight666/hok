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

  const bottleY = useTransform(scrollYProgress, [0, 0.5, 1], [90, -20, -130]);
  const bottleRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-8, 2, 7]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.45, 1], [0.92, 1.06, 0.98]);
  const auraScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.3, 0.9]);
  const bottleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.4]);

  return (
    <section ref={ref} className="relative mx-auto max-w-[1600px] px-5 py-32 sm:px-10 lg:py-48" data-testid="manifesto-section">
      {/* Top Section: First Statement on Left, Giant Bottle on Right */}
      <div className="relative z-10 max-w-[700px] lg:max-w-[760px]">
        <p className="eyebrow">The House</p>
        <ScrollWords
          text="Our perfumes use real, serious ingredients like it's the 1400s. Resins, woods, spirits and spice — things with weight, not a chemistry set with a French name."
          className="display-md mt-6 max-w-[22ch] font-display"
        />
      </div>

      {/* Floating Giant Perfume Bottle moved UP and made TWICE as big */}
      <div className="relative mt-12 flex items-center justify-center lg:absolute lg:right-6 lg:top-14 lg:mt-0 lg:w-[48%] lg:max-w-[720px] xl:right-12">
        {/* Ambient Warm Golden Aura */}
        <motion.div
          style={{ scale: auraScale }}
          className="pointer-events-none absolute h-[380px] w-[380px] rounded-full bg-gold/25 blur-[120px] dark:bg-gold/35 sm:h-[520px] sm:w-[520px] lg:h-[650px] lg:w-[650px]"
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
            className="group relative block cursor-pointer transition-transform duration-700 hover:scale-[1.03]"
            aria-label="Discover Blonde Amber - Signature Extrait"
          >
            <img
              src="/images/cut-blonde-amber.png"
              alt="House signature bottle - Blonde Amber"
              loading="lazy"
              draggable={false}
              className="bottle-shadow h-[62svh] max-h-[920px] min-h-[460px] w-auto select-none object-contain transition-all duration-700 group-hover:brightness-105 sm:h-[72svh] lg:h-[86svh]"
            />

            {/* Floating pill badge */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/70 bg-background/90 px-5 py-2 backdrop-blur-md shadow-xl transition-transform duration-500 group-hover:scale-105">
              <span className="flex items-center gap-2.5 text-[0.66rem] font-medium uppercase tracking-[0.28em] text-foreground">
                <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                Blonde Amber · Extrait de Parfum
              </span>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Second Statement moved back to its original indented space */}
      <div className="relative z-10 mt-16 sm:mt-24 lg:mt-32 lg:ml-[20%]">
        <ScrollWords
          text="Spray it on before you walk in and act surprised when the room turns around."
          className="display-md max-w-[20ch] font-display-italic text-gold"
        />
        <FadeUp className="mt-14 flex flex-wrap gap-4">
          <Link to="/collection" className="btn-royal" data-testid="manifesto-cta">Find your signature</Link>
          <Link to="/#best-sellers" className="btn-ghost-royal" data-testid="manifesto-armoury-cta">
            <span>Build a set</span>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
