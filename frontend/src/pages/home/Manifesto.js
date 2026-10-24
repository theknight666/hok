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

  // Bottle scroll entrance: gracefully glides into view from outside the screen on the right, then floats with subtle parallax
  const bottleX = useTransform(scrollYProgress, [0, 0.35, 1], [360, 0, -20]);
  const bottleY = useTransform(scrollYProgress, [0, 0.35, 1], [140, 0, -75]);
  const bottleRotate = useTransform(scrollYProgress, [0, 0.35, 1], [16, 0, -4]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.35, 1], [0.86, 1.03, 0.96]);
  const auraScale = useTransform(scrollYProgress, [0, 0.35, 1], [0.5, 1.35, 0.9]);
  const bottleOpacity = useTransform(scrollYProgress, [0, 0.18, 0.85, 1], [0, 1, 1, 0.6]);

  return (
    <section
      ref={ref}
      className="relative mx-auto max-w-[1600px] overflow-x-clip px-5 py-16 sm:px-10 lg:py-24"
      data-testid="manifesto-section"
    >
      {/* Top Section: First Statement on Left, Free-Floating Bottle on Right */}
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-center">
        {/* Left Column: First Statement */}
        <div className="relative z-10 lg:col-span-7">
          <p className="font-display text-base font-semibold uppercase tracking-[0.32em] text-gold sm:text-lg">
            The House
          </p>

          <ScrollWords
            text="Our perfumes use real, serious ingredients like it's the 1400s. Resins, woods, spirits and spice — things with weight, not a chemistry set with a French name."
            className="display-md mt-6 max-w-[22ch] font-display text-foreground"
          />
        </div>

        {/* Right Column: Free-Floating Unconfined Perfume Bottle (Scroll Entrance from Outside Screen) */}
        <div className="relative flex items-center justify-center lg:col-span-5">
          {/* Ambient Warm Golden Aura */}
          <motion.div
            style={{ scale: auraScale }}
            className="pointer-events-none absolute h-[360px] w-[360px] rounded-full bg-gold/25 blur-[110px] dark:bg-gold/35 sm:h-[460px] sm:w-[460px]"
            aria-hidden="true"
          />

          <motion.div
            style={{
              x: bottleX,
              y: bottleY,
              rotate: bottleRotate,
              scale: bottleScale,
              opacity: bottleOpacity,
            }}
            whileHover={{ scale: 1.07, rotate: 2, y: -14 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center will-change-transform transform-gpu cursor-pointer"
          >
            <Link
              to="/fragrance/blonde-amber"
              className="group relative block"
              aria-label="Discover Blonde Amber - Signature Extrait"
            >
              <img
                src="/images/cut-blonde-amber.png"
                alt="House signature bottle - Blonde Amber"
                loading="lazy"
                draggable={false}
                className="bottle-shadow h-[58svh] max-h-[740px] min-h-[420px] w-auto select-none object-contain transition-all duration-700 group-hover:brightness-110 sm:h-[66svh] lg:h-[72svh]"
              />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Second Statement in original indented space, tightly connected without dead negative space */}
      <div className="relative z-10 mt-12 sm:mt-16 lg:mt-20 lg:ml-[20%]">
        <ScrollWords
          text="Spray it on before you walk in and act surprised when the room turns around."
          className="display-md max-w-[20ch] font-display-italic text-gold"
        />

        <FadeUp className="mt-12 flex flex-wrap gap-4">
          <Link to="/collection" className="btn-royal" data-testid="manifesto-cta">
            Find your signature
          </Link>
          <Link to="/#best-sellers" className="btn-ghost-royal" data-testid="manifesto-armoury-cta">
            <span>Build a set</span>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
