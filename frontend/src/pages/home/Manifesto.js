import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ScrollWords, FadeUp } from "@/components/site/Reveal";
import { KnightMark } from "@/components/site/Logo";

export function Manifesto() {
  const act1Ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: act1Ref,
    offset: ["start end", "end start"],
  });

  // Silky damped spring for weighted luxury physical inertia (direct scroll scrubbing)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    mass: 0.6,
    restDelta: 0.0005,
  });

  // 1. Vertical elevation: rises smoothly into place as you scroll, then continues with gentle parallax
  const bottleY = useTransform(smoothProgress, [0.05, 0.42, 0.9], [70, 0, -32]);

  // 2. Majestic scale expansion: from 0.90 to 1.0 at center, then slight float
  const bottleScale = useTransform(smoothProgress, [0.05, 0.42, 0.9], [0.90, 1.0, 0.98]);

  // 3. Cinematic Blur & Focus: emerges from a soft optical blur to crystal sharp focus
  const bottleBlur = useTransform(smoothProgress, [0.05, 0.38], [10, 0]);
  const bottleFilter = useTransform(bottleBlur, (v) => `blur(${v}px)`);

  // 4. Smooth Opacity Fade-in
  const bottleOpacity = useTransform(smoothProgress, [0.05, 0.35, 0.85, 1], [0, 1, 1, 0.4]);

  // 5. Regal Poise Tilt: settles from 2.8 degrees into proud upright alignment
  const bottleRotate = useTransform(smoothProgress, [0.05, 0.42, 0.9], [2.8, 0, -1.2]);

  // 6. Atmospheric Golden Halo Bloom
  const auraScale = useTransform(smoothProgress, [0.05, 0.45, 0.9], [0.6, 1.25, 1.0]);
  const auraOpacity = useTransform(smoothProgress, [0.05, 0.35, 0.85, 1], [0, 0.48, 0.48, 0.2]);

  return (
    <section
      className="relative mx-auto max-w-[1600px] overflow-x-clip px-5 py-16 sm:px-10 lg:py-24"
      data-testid="manifesto-section"
    >
      {/* ======================================================== */}
      {/* ACT I: The Philosophy & The Animated Flacon Entrance     */}
      {/* ======================================================== */}
      <div ref={act1Ref} className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-center">
        {/* Left Column: First Statement & Craft Hallmarks */}
        <div className="relative z-10 lg:col-span-7">
          <p className="font-display text-base font-semibold uppercase tracking-[0.32em] text-gold sm:text-lg">
            The House
          </p>

          <ScrollWords
            text="Our perfumes use real, serious ingredients like it's the 1400s. Resins, woods, spirits and spice — things with weight, not a chemistry set with a French name."
            className="display-md mt-6 max-w-[22ch] font-display text-foreground"
          />

          {/* Understated House Hallmarks */}
          <FadeUp delay={0.2} className="mt-10 flex flex-wrap items-center gap-6 border-t border-border/40 pt-8 sm:gap-10">
            <div>
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold">Extraction</p>
              <p className="mt-1 font-display text-base tracking-tight text-foreground sm:text-lg">
                Artisanal Distillation
              </p>
            </div>
            <div className="hidden h-8 w-px bg-border/50 sm:block" />
            <div>
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold">Maturation</p>
              <p className="mt-1 font-display text-base tracking-tight text-foreground sm:text-lg">
                Six-Week Maceration
              </p>
            </div>
            <div className="hidden h-8 w-px bg-border/50 sm:block" />
            <div>
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold">Integrity</p>
              <p className="mt-1 font-display text-base tracking-tight text-foreground sm:text-lg">
                Zero Diluents
              </p>
            </div>
          </FadeUp>
        </div>

        {/* Right Column: Architectural Pedestal for the Signature Flacon */}
        <div className="relative flex items-center justify-center lg:col-span-5 min-h-[580px] sm:min-h-[700px]">
          {/* Ambient Warm Golden Aura with subtle breathing */}
          <motion.div
            style={{ scale: auraScale, opacity: auraOpacity }}
            className="pointer-events-none absolute h-[520px] w-[520px] rounded-full bg-gold/30 blur-[120px] dark:bg-gold/35 sm:h-[650px] sm:w-[650px]"
            aria-hidden="true"
          />

          {/* Scroll-Scrubbed Flacon Reveal Container */}
          <motion.div
            style={{
              y: bottleY,
              scale: bottleScale,
              rotate: bottleRotate,
              opacity: bottleOpacity,
              filter: bottleFilter,
            }}
            className="relative flex flex-col items-center will-change-transform transform-gpu"
          >
            {/* Subtle Ethereal Ambient Levitation Loop */}
            <motion.div
              animate={{ y: [-3.5, 3.5, -3.5] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="will-change-transform transform-gpu"
            >
              <Link
                to="/fragrance/blonde-amber"
                className="group relative block cursor-pointer"
                aria-label="Discover Blonde Amber - Signature Eau de Parfum"
              >
                <motion.div
                  whileHover={{ scale: 1.04, y: -6, rotate: 0.8 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="will-change-transform transform-gpu"
                >
                  <img
                    src="/images/cut-blonde-amber.png"
                    alt="House signature bottle - Blonde Amber"
                    loading="eager"
                    draggable={false}
                    className="bottle-shadow h-[68svh] max-h-[810px] min-h-[440px] sm:h-[78svh] sm:max-h-[845px] lg:h-[80svh] lg:max-h-[880px] w-auto select-none object-contain transition-all duration-700 group-hover:brightness-105 group-hover:drop-shadow-[0_20px_45px_rgba(212,162,76,0.25)]"
                  />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ACT II: The Sillage Credo (Editorial 3-Part Pavilion)    */}
      {/* ======================================================== */}
      <div className="relative mt-12 sm:mt-16 lg:mt-20">
        {/* Ambient Warm Golden Glow in Center */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[620px] rounded-full bg-gold/15 blur-[130px] dark:bg-gold/20"
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Editorial Flank: Sillage & Projection */}
          <FadeUp
            delay={0.1}
            className="hidden flex-col justify-center border-l border-border/60 pl-8 lg:col-span-3 lg:flex"
          >
            <span className="font-display text-[0.66rem] uppercase tracking-[0.32em] text-gold">
              The Sillage
            </span>
            <h3 className="mt-4 font-display text-2xl tracking-tight text-foreground">
              Room-Filling Presence
            </h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
              Formulated with heavy resins and pure absolutes that cling to collar and skin. A whisper at two paces; an unforgettable statement at one.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-[0.64rem] font-medium uppercase tracking-[0.26em] text-foreground/80">
                12+ Hours Longevity
              </span>
            </div>
          </FadeUp>

          {/* Centerpiece: The Bold Statement & Call to Action */}
          <div className="text-center lg:col-span-6 lg:px-4">
            <div className="mb-6 inline-flex items-center justify-center">
              <KnightMark className="h-[72px] w-[72px] sm:h-20 sm:w-20 transition-transform duration-500 hover:scale-110" />
            </div>

            <ScrollWords
              text="Spray it on before you walk in and act surprised when the room turns around."
              className="display-md font-display-italic text-gold"
            />

            <FadeUp className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link to="/collection" className="btn-royal" data-testid="manifesto-cta">
                Find your signature
              </Link>
              <Link to="/#best-sellers" className="btn-ghost-royal" data-testid="manifesto-armoury-cta">
                <span>Build a set</span>
              </Link>
            </FadeUp>
          </div>

          {/* Right Editorial Flank: Maturation */}
          <FadeUp
            delay={0.2}
            className="hidden flex-col justify-center border-r border-border/60 pr-8 text-right lg:col-span-3 lg:flex"
          >
            <span className="font-display text-[0.66rem] uppercase tracking-[0.32em] text-gold">
              The Maturation
            </span>
            <h3 className="mt-4 font-display text-2xl tracking-tight text-foreground">
              Cold Macerated
            </h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
              Each fragrance is cold-macerated for six weeks in sealed dark vessels before hand-decanting into weighted Italian crystal flacons.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <span className="text-[0.64rem] font-medium uppercase tracking-[0.26em] text-foreground/80">
                Small-Batch Crafted
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            </div>
          </FadeUp>
        </div>

        {/* Mobile / Tablet Architectural Cards */}
        <div className="relative z-10 mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:hidden">
          <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm">
            <span className="font-display text-[0.66rem] uppercase tracking-[0.28em] text-gold">
              The Sillage
            </span>
            <h4 className="mt-2 font-display text-xl text-foreground">Room-Filling Presence</h4>
            <p className="mt-2 text-xs font-light text-muted-foreground">
              Formulated with heavy resins and pure absolutes that cling to collar and skin. 12+ hours unbroken trail.
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm">
            <span className="font-display text-[0.66rem] uppercase tracking-[0.28em] text-gold">
              The Maturation
            </span>
            <h4 className="mt-2 font-display text-xl text-foreground">Cold Macerated</h4>
            <p className="mt-2 text-xs font-light text-muted-foreground">
              Macerated for six weeks in sealed dark vessels and hand-bottled in small artisanal batches.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
