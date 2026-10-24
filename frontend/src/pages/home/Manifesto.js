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

  // Bottle parallax transforms
  const bottleY = useTransform(scrollYProgress, [0, 0.5, 1], [90, -20, -130]);
  const bottleRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-8, 2, 7]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.45, 1], [0.92, 1.06, 0.98]);
  const auraScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.3, 0.9]);
  const bottleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.4]);

  // Raw material vignettes parallax transforms
  const noteLeftY = useTransform(scrollYProgress, [0.15, 0.65, 1], [80, -25, -95]);
  const noteLeftRotate = useTransform(scrollYProgress, [0.15, 0.65, 1], [-7, 3, 9]);
  const noteRightY = useTransform(scrollYProgress, [0.2, 0.7, 1], [110, -15, -120]);
  const noteRightRotate = useTransform(scrollYProgress, [0.2, 0.7, 1], [9, -2, -8]);

  return (
    <section ref={ref} className="relative mx-auto max-w-[1600px] overflow-hidden px-5 py-32 sm:px-10 lg:overflow-visible lg:py-48" data-testid="manifesto-section">
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
          </Link>
        </motion.div>
      </div>

      {/* Lower Section with Left & Right Floating Raw Material Vignettes */}
      <div className="relative z-10 mt-20 sm:mt-28 lg:mt-36">
        {/* Left Vignette: Mysore Sandalwood & Aged Woods */}
        <motion.div
          style={{ y: noteLeftY, rotate: noteLeftRotate }}
          className="pointer-events-none absolute -left-2 bottom-6 z-0 hidden select-none flex-col items-center gap-3 lg:flex xl:left-4"
          aria-hidden="true"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gold/20 blur-2xl" />
            <img
              src="/images/notes/sandalwood.png"
              alt="Mysore Sandalwood"
              loading="lazy"
              draggable={false}
              className="relative h-44 w-44 object-contain drop-shadow-[0_22px_30px_rgba(0,0,0,0.22)] xl:h-52 xl:w-52"
            />
          </div>
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-muted-foreground/80">
            Mysore Sandalwood · Aged Woods
          </span>
        </motion.div>

        {/* Center Statement & Call to Action */}
        <div className="relative z-10 lg:ml-[22%] lg:max-w-[620px] xl:ml-[25%]">
          <ScrollWords
            text="Spray it on before you walk in and act surprised when the room turns around."
            className="display-md max-w-[22ch] font-display-italic text-gold"
          />
          <FadeUp className="mt-14 flex flex-wrap gap-4">
            <Link to="/collection" className="btn-royal" data-testid="manifesto-cta">Find your signature</Link>
            <Link to="/#best-sellers" className="btn-ghost-royal" data-testid="manifesto-armoury-cta">
              <span>Build a set</span>
            </Link>
          </FadeUp>
        </div>

        {/* Right Vignette: Aged Cognac & Oak Spirits */}
        <motion.div
          style={{ y: noteRightY, rotate: noteRightRotate }}
          className="pointer-events-none absolute right-2 bottom-10 z-0 hidden select-none flex-col items-center gap-3 lg:flex xl:right-8"
          aria-hidden="true"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gold/20 blur-2xl" />
            <img
              src="/images/notes/cognac.png"
              alt="French Oak & Cognac"
              loading="lazy"
              draggable={false}
              className="relative h-48 w-48 object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.25)] xl:h-56 xl:w-56"
            />
          </div>
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-muted-foreground/80">
            French Oak & Spirits · Maceration
          </span>
        </motion.div>
      </div>
    </section>
  );
}
