import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CREATIONS = [
  { roman: "I", name: "Blonde Amber", note: "Molten Amber · Blonde Tobacco · Aged Rum" },
  { roman: "II", name: "Layton", note: "Aristocratic Lavender · Crisp Apple · Noble Woods" },
  { roman: "III", name: "Angels Share", note: "Cognac Over Ice · Roasted Praline · French Oak" },
  { roman: "IV", name: "Side Effect", note: "Cured Tobacco · Crimson Saffron · Dark Leather" },
];

const CURTAIN_EASE = [0.77, 0, 0.175, 1];

export function Intro() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("intro") || urlParams.has("preloader")) return true;
    return !sessionStorage.getItem("hotk_intro_v4");
  });

  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!show) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sessionStorage.setItem("hotk_intro_v4", "1");

    const startTime = performance.now();
    const duration = 2000; // 2.0s elegant progression

    let frameId;
    const updateProgress = (currentTime) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(1, elapsed / duration);

      // Smooth luxury deceleration curve
      const easedT = t < 0.6 ? 1.35 * Math.pow(t, 1.15) : 1 - Math.pow(1 - t, 2.8);
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
        }, 500);
      }
    };

    frameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(frameId);
      document.body.style.overflow = prevOverflow;
    };
  }, [show]);

  // Determine active creation stage based on progress
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
    }, 200);
  };

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="preloader-curtain"
          data-testid="intro-curtain"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: CURTAIN_EASE }}
          className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden bg-[#110E13] text-[#FBF8F3] will-change-transform transform-gpu shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Subtle Warm Amber Paper Atmosphere */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,162,76,0.14)_0%,rgba(17,14,19,0.98)_72%)]"
            aria-hidden="true"
          />

          {/* Golden Ambient Vignette Glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] sm:h-[540px] sm:w-[540px] rounded-full bg-gradient-to-b from-[#D4A24C]/18 via-[#F2A900]/08 to-transparent blur-[120px]"
            aria-hidden="true"
          />

          {/* Micro-grain texture */}
          <div className="grain pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

          {/* Bottom Golden Hairline Seam */}
          <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4A24C]/60 to-transparent shadow-[0_0_12px_rgba(212,162,76,0.5)]" />

          {/* Main Layout Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0 }}
            transition={{ duration: 0.5, ease: CURTAIN_EASE }}
            className="relative z-20 flex h-full w-full flex-col items-center justify-between px-6 py-10 sm:px-12 sm:py-14"
          >
            {/* TOP BAR: Heritage & Provenance */}
            <header className="flex w-full items-center justify-between text-[0.62rem] sm:text-[0.68rem] uppercase tracking-[0.32em] text-[#D4A24C]/80 font-mono">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4A24C] shadow-[0_0_8px_#D4A24C]" />
                Maison de Haute Parfumerie
              </span>
              <span className="hidden sm:inline-block text-[#EFE8DC]/50">
                New Delhi · Grasse · Paris
              </span>
              <span>MMXXVI</span>
            </header>

            {/* CENTER STAGE: Emblem & House Crest */}
            <main className="flex flex-col items-center text-center my-auto max-w-xl">
              {/* Crest Medallion with Subtle Halo */}
              <div className="relative mb-7 flex items-center justify-center">
                {/* Delicate Gold Border Medallion */}
                <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border border-[#D4A24C]/35 bg-gradient-to-b from-[#1C1821] to-[#110E13] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-center">
                  <motion.img
                    src="/images/hok-monogram.png"
                    alt="House of the Knight Monogram"
                    initial={{ scale: 0.88, opacity: 0 }}
                    animate={{ scale: [0.96, 1.02, 0.98], opacity: 1 }}
                    transition={{
                      scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                      opacity: { duration: 0.7 },
                    }}
                    className="h-full w-full object-contain filter drop-shadow-[0_0_16px_rgba(212,162,76,0.45)]"
                  />
                  {/* Outer Hairline Halo */}
                  <div className="pointer-events-none absolute -inset-2.5 rounded-full border border-[#D4A24C]/15" />
                </div>
              </div>

              {/* Sculpted Editorial Typography */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: CURTAIN_EASE }}
              >
                <p className="text-[0.58rem] sm:text-[0.66rem] font-mono uppercase tracking-[0.42em] text-[#D4A24C] mb-2.5">
                  The Private Collection
                </p>
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight uppercase text-[#FBF8F3]">
                  House of the{" "}
                  <span className="font-display-italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4A24C] via-[#FFE4A0] to-[#C59B3F] drop-shadow-[0_2px_14px_rgba(212,162,76,0.35)]">
                    Knight
                  </span>
                </h1>
              </motion.div>

              {/* Dynamic Creation Reveal */}
              <div className="h-14 mt-5 flex flex-col items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCreation.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xs sm:text-sm font-medium tracking-[0.18em] text-[#F6EFE4] uppercase">
                      Extract {currentCreation.roman} — {currentCreation.name}
                    </span>
                    <span className="text-[0.62rem] sm:text-[0.7rem] tracking-[0.24em] text-[#D4A24C]/80 uppercase mt-1">
                      {currentCreation.note}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            {/* BOTTOM STAGE: Precision Progress & Skip */}
            <footer className="w-full max-w-lg flex flex-col items-center">
              {/* Ultra-Fine Gold Progress Line */}
              <div className="relative w-full h-[2px] rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#D4A24C] via-[#FFE5A3] to-[#F2A900] rounded-full shadow-[0_0_10px_rgba(242,169,0,0.6)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>

              {/* Sub-bar Details: Concentration, Progress Counter, Skip Action */}
              <div className="mt-4 w-full flex items-center justify-between text-xs text-[#EFE8DC]/70 font-mono">
                <span className="text-[0.6rem] sm:text-[0.64rem] tracking-[0.24em] uppercase opacity-75">
                  EDP · 50 ML
                </span>

                <div className="flex items-baseline gap-1 text-[#D4A24C]">
                  <span className="text-base sm:text-lg font-light tracking-widest font-mono">
                    {progress < 10 ? `0${progress}` : progress}
                  </span>
                  <span className="text-[0.65rem] opacity-70">%</span>
                </div>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-[0.62rem] sm:text-[0.66rem] uppercase tracking-[0.22em] text-[#D4A24C] hover:text-[#FFE5A3] transition-colors hover:underline cursor-pointer flex items-center gap-1"
                >
                  Enter House <span aria-hidden="true">→</span>
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
