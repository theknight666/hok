import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CREATIONS = [
  {
    num: "01",
    roman: "I",
    name: "Blonde Amber",
    tagline: "The Sovereign Amber",
    notes: "Molten Amber · Blonde Tobacco · Aged Rum",
    image: "/images/cut-blonde-amber.png",
    glow: "rgba(242, 169, 0, 0.32)",
    accent: "#F2A900",
  },
  {
    num: "02",
    roman: "II",
    name: "Layton",
    tagline: "The Aristocratic Wood",
    notes: "Crisp Green Apple · French Lavender · Noble Woods",
    image: "/images/cut-layton.png",
    glow: "rgba(35, 56, 219, 0.32)",
    accent: "#768BFF",
  },
  {
    num: "03",
    roman: "III",
    name: "Angels Share",
    tagline: "The Heavenly Reserve",
    notes: "French Oak-Aged Cognac · Roasted Praline · Cinnamon Ice",
    image: "/images/cut-angels-share.png",
    glow: "rgba(201, 71, 27, 0.36)",
    accent: "#FFA06A",
  },
  {
    num: "04",
    roman: "IV",
    name: "Side Effect",
    tagline: "The Midnight Enigma",
    notes: "Cured Tobacco Leaf · Crimson Saffron · Dark Leather",
    image: "/images/cut-side-effect.png",
    glow: "rgba(180, 20, 80, 0.36)",
    accent: "#E24F88",
  },
];

const LUXURY_EASE = [0.83, 0, 0.17, 1];

export function Intro() {
  // Always show preloader on every page reload per user instruction (will revert when user texts "revert")
  const [show, setShow] = useState(true);

  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!show) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const startTime = performance.now();
    const duration = 2100; // 2.1s stately cinematic reveal

    let frameId;
    const updateProgress = (currentTime) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(1, elapsed / duration);

      // Smooth luxury deceleration curve
      const easedT = t < 0.6 ? 1.32 * Math.pow(t, 1.15) : 1 - Math.pow(1 - t, 2.7);
      const currentVal = Math.min(100, Math.round(easedT * 100));

      setProgress(currentVal);

      if (t < 1) {
        frameId = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        setIsExiting(true);
        setTimeout(() => {
          setShow(false);
          document.body.style.overflow = prevOverflow;
        }, 550);
      }
    };

    frameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(frameId);
      document.body.style.overflow = prevOverflow;
    };
  }, [show]);

  // Active fragrance creation based on progress
  const currentCreation = useMemo(() => {
    if (progress < 25) return CREATIONS[0];
    if (progress < 50) return CREATIONS[1];
    if (progress < 75) return CREATIONS[2];
    return CREATIONS[3];
  }, [progress]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      document.body.style.overflow = "";
      setShow(false);
    }, 220);
  };

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="ultra-premium-preloader"
          data-testid="intro-curtain"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.95, ease: LUXURY_EASE }}
          className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden bg-[#0A080D] text-[#FBF8F3] will-change-transform transform-gpu shadow-[0_30px_90px_rgba(0,0,0,0.95)]"
        >
          {/* ======================================================== */}
          {/* ARCHITECTURAL BACKGROUND: Caustic Aura, Watermark & Grain */}
          {/* ======================================================== */}
          {/* Dynamic Volumetric Caustic Bloom */}
          <motion.div
            key={currentCreation.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] sm:h-[750px] sm:w-[750px] rounded-full blur-[140px]"
            style={{
              background: `radial-gradient(circle, ${currentCreation.glow} 0%, rgba(10,8,13,0) 70%)`,
            }}
            aria-hidden="true"
          />

          {/* Monumental Watermark Typography across Stage */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.032] select-none"
            aria-hidden="true"
          >
            <span className="font-display text-[15vw] font-black uppercase tracking-[-0.04em] whitespace-nowrap text-[#FBF8F3]">
              HOUSE OF THE KNIGHT
            </span>
          </div>

          {/* Analog Texture Grain */}
          <div className="grain pointer-events-none absolute inset-0 opacity-45" aria-hidden="true" />

          {/* Gilded Top & Bottom Frame Hairlines */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A24C]/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4A24C]/70 to-transparent shadow-[0_0_16px_rgba(212,162,76,0.5)]" />

          {/* ======================================================== */}
          {/* MAIN CHOREOGRAPHED STAGE CONTENT                         */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -24 : 0 }}
            transition={{ duration: 0.5, ease: LUXURY_EASE }}
            className="relative z-20 flex h-full w-full flex-col items-center justify-between px-5 py-8 sm:px-12 sm:py-12"
          >
            {/* TOP BAR: Heritage & Provenance */}
            <header className="flex w-full items-center justify-between text-[0.6rem] sm:text-[0.66rem] uppercase tracking-[0.34em] text-[#D4A24C]/85 font-mono">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rotate-45 bg-[#D4A24C] shadow-[0_0_8px_#D4A24C]" />
                Maison de Haute Parfumerie
              </span>

              <span className="hidden md:inline-flex items-center gap-2 text-[#EFE8DC]/60 tracking-[0.3em]">
                <span>Paris</span>
                <span className="opacity-40">·</span>
                <span>Grasse</span>
                <span className="opacity-40">·</span>
                <span>New Delhi</span>
              </span>

              <span className="flex items-center gap-1.5 font-mono">
                <span className="text-[#EFE8DC]/50">EST.</span> MMXXVI
              </span>
            </header>

            {/* ======================================================== */}
            {/* CENTERPIECE: Grand Flacon, Crest & Monumental Typography */}
            {/* ======================================================== */}
            <main className="flex flex-col items-center text-center my-auto w-full max-w-2xl">
              {/* Heraldic Gold Monogram Seal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: LUXURY_EASE }}
                className="relative mb-3 flex items-center justify-center"
              >
                <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-[#D4A24C]/40 bg-gradient-to-b from-[#1C1724] to-[#0D0A11] p-3 shadow-[0_4px_24px_rgba(0,0,0,0.8)] flex items-center justify-center">
                  <img
                    src="/images/hok-monogram.png"
                    alt="House of the Knight Crest"
                    className="h-full w-full object-contain filter drop-shadow-[0_0_12px_rgba(212,162,76,0.5)]"
                  />
                  {/* Subtle Concentric Halo */}
                  <div className="pointer-events-none absolute -inset-2 rounded-full border border-[#D4A24C]/15" />
                </div>
              </motion.div>

              {/* Monumental Editorial Brand Name */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.85, ease: LUXURY_EASE }}
                className="mb-1"
              >
                <p className="text-[0.58rem] sm:text-[0.66rem] font-mono uppercase tracking-[0.42em] text-[#D4A24C] mb-1.5">
                  The Private Collection
                </p>
                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.02em] uppercase leading-none text-[#FBF8F3]">
                  House of the{" "}
                  <span className="font-display-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#F7D58C] via-[#FFF3D2] to-[#C99638] drop-shadow-[0_2px_18px_rgba(212,162,76,0.45)]">
                    Knight
                  </span>
                </h1>
              </motion.div>

              {/* CENTER STAGE HERO: Floating Crystal Flacon */}
              <div className="relative my-2 sm:my-4 flex items-center justify-center h-44 sm:h-56 lg:h-64 w-full">
                {/* Backlight halo behind flacon */}
                <div
                  className="pointer-events-none absolute h-36 w-36 sm:h-48 sm:w-48 rounded-full blur-[60px]"
                  style={{ background: currentCreation.glow }}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCreation.name}
                    initial={{ opacity: 0, scale: 0.88, y: 16 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: [0, -7, 0],
                    }}
                    exit={{ opacity: 0, scale: 0.94, y: -16 }}
                    transition={{
                      opacity: { duration: 0.45 },
                      scale: { duration: 0.45 },
                      y: {
                        duration: 3.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    className="relative z-10 flex flex-col items-center justify-center h-full"
                  >
                    <img
                      src={currentCreation.image}
                      alt={currentCreation.name}
                      className="h-full w-auto max-h-[180px] sm:max-h-[225px] lg:max-h-[260px] object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.85)] filter contrast-[1.04]"
                      draggable={false}
                    />
                    {/* Floor Reflection / Shadow */}
                    <div className="mt-1 h-3 w-28 sm:w-36 rounded-full bg-black/60 blur-md" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dynamic Extract Details */}
              <div className="h-14 flex flex-col items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCreation.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rotate-45 bg-[#D4A24C]" />
                      <span className="font-display text-sm sm:text-base font-semibold tracking-[0.16em] uppercase text-[#FBF8F3]">
                        Extract {currentCreation.roman} — {currentCreation.name}
                      </span>
                      <span className="h-1.5 w-1.5 rotate-45 bg-[#D4A24C]" />
                    </div>
                    <p className="mt-1 font-mono text-[0.62rem] sm:text-[0.7rem] uppercase tracking-[0.24em] text-[#D4A24C]/90">
                      {currentCreation.notes}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 4 Sovereign Extracts Horizontal Indicator Ribbon */}
              <div className="mt-3 hidden sm:flex items-center justify-center gap-1.5 p-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md">
                {CREATIONS.map((c) => {
                  const isActive = c.name === currentCreation.name;
                  return (
                    <div
                      key={c.num}
                      className={`px-3 py-1 rounded-full text-[0.58rem] font-mono uppercase tracking-[0.18em] transition-all duration-300 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-gradient-to-r from-[#D4A24C]/30 to-[#F2A900]/20 text-[#FFE5A3] border border-[#D4A24C]/50 shadow-[0_0_12px_rgba(212,162,76,0.3)]"
                          : "text-[#EFE8DC]/40"
                      }`}
                    >
                      <span className="opacity-60">{c.num}</span>
                      <span>{c.name}</span>
                    </div>
                  );
                })}
              </div>
            </main>

            {/* ======================================================== */}
            {/* BOTTOM STAGE: Precision Chronometer & Velvet Bar         */}
            {/* ======================================================== */}
            <footer className="w-full max-w-xl flex flex-col items-center">
              {/* Precision Dual-Track Progress Bar with Jewel Glider */}
              <div className="relative w-full h-[3px] rounded-full bg-white/10 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#D4A24C] via-[#FFE299] to-[#F2A900] rounded-full shadow-[0_0_14px_rgba(242,169,0,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>

              {/* Sub-bar Details: Specification, Oversized Percentage, Skip */}
              <div className="mt-4 w-full flex items-center justify-between text-[#EFE8DC]/70 font-mono text-xs">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[0.62rem] sm:text-[0.66rem] uppercase tracking-[0.22em] text-[#D4A24C]">
                    Eau de Parfum
                  </span>
                  <span className="text-[0.56rem] tracking-[0.18em] uppercase text-[#EFE8DC]/50">
                    50 ml · Hand-Decanted
                  </span>
                </div>

                {/* Haute-Horlogerie Numerical Counter */}
                <div className="flex items-baseline gap-1 text-[#F7D58C] drop-shadow-[0_0_12px_rgba(212,162,76,0.4)]">
                  <span className="font-display text-2xl sm:text-3xl font-light tracking-widest font-mono">
                    {progress < 10 ? `0${progress}` : progress}
                  </span>
                  <span className="text-[0.7rem] font-mono text-[#D4A24C]">%</span>
                </div>

                {/* Ultra-Luxury Skip Button */}
                <button
                  type="button"
                  onClick={handleSkip}
                  className="group relative px-4 py-1.5 rounded-full border border-[#D4A24C]/40 bg-[#16121B]/80 hover:bg-[#D4A24C] text-[#D4A24C] hover:text-[#0A080D] transition-all duration-300 font-mono text-[0.62rem] uppercase tracking-[0.22em] cursor-pointer flex items-center gap-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                >
                  <span>Enter House</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
