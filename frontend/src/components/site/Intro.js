import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  { threshold: 0, label: "Sourcing Rare Absolutes & Resins" },
  { threshold: 30, label: "Six-Week Cold Maceration" },
  { threshold: 68, label: "Hand-Decanting Crystal Flacons" },
  { threshold: 94, label: "The Keep Is Open" },
];

const LUXURY_EASE = [0.85, 0, 0.15, 1];

export function Intro() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("intro") || urlParams.has("preloader")) return true;
    return !sessionStorage.getItem("hotk_intro_v3");
  });

  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Smooth counter animation
  useEffect(() => {
    if (!show) return undefined;

    // Lock background scroll during preloader
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    sessionStorage.setItem("hotk_intro_v3", "1");

    const startTime = performance.now();
    const duration = 1800; // 1.8s progress duration

    let frameId;
    const updateProgress = (currentTime) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(1, elapsed / duration);

      // Smooth custom acceleration/deceleration
      const easedT = t < 0.7 ? 1.4 * Math.pow(t, 1.2) : 1 - Math.pow(1 - t, 2.5);
      const currentVal = Math.min(100, Math.round(easedT * 100));

      setProgress(currentVal);

      if (t < 1) {
        frameId = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        setIsFinishing(true);
        // Linger briefly at 100% for the grand gate split
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

  // Current stage copy based on progress
  const currentStage = useMemo(() => {
    for (let i = STAGES.length - 1; i >= 0; i--) {
      if (progress >= STAGES[i].threshold) {
        return STAGES[i].label;
      }
    }
    return STAGES[0].label;
  }, [progress]);

  // Floating ambient motes
  const motes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: (i * 23) % 96 + 2,
        y: (i * 37) % 80 + 10,
        size: (i % 3) + 1.5,
        duration: 3 + (i % 4) * 0.8,
        delay: (i % 5) * 0.3,
      })),
    []
  );

  const handleSkip = () => {
    document.body.style.overflow = "";
    setShow(false);
  };

  return (
    <AnimatePresence mode="wait">
      {show && (
        <div
          data-testid="intro-curtain"
          className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden"
        >
          {/* ======================================================== */}
          {/* DUAL SHUTTER GATE PANELS                                 */}
          {/* ======================================================== */}
          {/* Top Panel (Glides Upwards) */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.95, ease: LUXURY_EASE }}
            className="absolute inset-x-0 top-0 h-1/2 bg-[#09080B] will-change-transform transform-gpu shadow-2xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,162,76,0.12)_0%,rgba(9,8,11,1)_70%)]" />
          </motion.div>

          {/* Bottom Panel (Glides Downwards) */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.95, ease: LUXURY_EASE }}
            className="absolute inset-x-0 bottom-0 h-1/2 bg-[#09080B] will-change-transform transform-gpu shadow-2xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,162,76,0.12)_0%,rgba(9,8,11,1)_70%)]" />
          </motion.div>

          {/* Glowing Horizon Seam Filament */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: isFinishing ? 1.15 : 1, opacity: isFinishing ? 1 : 0.4 }}
            exit={{ scaleX: 1.4, opacity: 0 }}
            transition={{ duration: 0.6, ease: LUXURY_EASE }}
            className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#F2A900] to-transparent z-10 will-change-transform"
          />

          {/* ======================================================== */}
          {/* CENTER LUXURY CONTENT                                    */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, y: -16 }}
            transition={{ duration: 0.65, ease: LUXURY_EASE }}
            className="relative z-20 flex h-full w-full flex-col items-center justify-between px-6 py-10 sm:py-14 text-[#FBF8F3]"
          >
            {/* Ambient Celestial Aura */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[340px] w-[340px] sm:h-[480px] sm:w-[480px] rounded-full bg-gradient-to-b from-[#D4A24C]/25 via-[#F2A900]/15 to-transparent blur-[110px]"
              aria-hidden="true"
            />

            {/* Drifting Golden Motes */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              {motes.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: [0, 0.65, 0],
                    y: [-10, -70],
                  }}
                  transition={{
                    duration: m.duration,
                    repeat: Infinity,
                    delay: m.delay,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: `${m.x}%`,
                    top: `${m.y}%`,
                    width: `${m.size}px`,
                    height: `${m.size}px`,
                  }}
                  className="absolute rounded-full bg-[#F2A900] shadow-[0_0_6px_#F2A900]"
                />
              ))}
            </div>

            {/* TOP HEADER: Heritage Watermark */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8, ease: LUXURY_EASE }}
              className="flex items-center gap-3 text-center"
            >
              <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#D4A24C]/60" />
              <p className="text-[0.58rem] sm:text-[0.64rem] font-mono uppercase tracking-[0.38em] text-[#D4A24C]">
                Maison de Haute Parfumerie · MMXXVI
              </p>
              <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#D4A24C]/60" />
            </motion.div>

            {/* CENTER STAGE: Heraldic Crest & Wordmark */}
            <div className="flex flex-col items-center text-center -mt-4">
              {/* Heraldic Emblem with Orbital Ring */}
              <div className="relative mb-6 flex items-center justify-center">
                {/* Rotating Dashed Orbital Halo */}
                <svg
                  className="absolute h-28 w-28 sm:h-36 sm:w-36 animate-[spin_24s_linear_infinite]"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="rgba(212, 162, 76, 0.3)"
                    strokeWidth="0.75"
                    strokeDasharray="4 8"
                  />
                </svg>

                {/* Inner Solid Halo Ring */}
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border border-[#D4A24C]/40 bg-[#0C0B0E]/60 p-5 backdrop-blur-md shadow-2xl flex items-center justify-center">
                  <motion.img
                    src="/images/hok-monogram.png"
                    alt="House of the Knight Crest"
                    initial={{ scale: 0.82, opacity: 0 }}
                    animate={{
                      scale: [0.94, 1.03, 0.98],
                      opacity: 1,
                    }}
                    transition={{
                      scale: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
                      opacity: { duration: 0.8 },
                    }}
                    className="h-full w-full object-contain filter drop-shadow-[0_0_16px_rgba(242,169,0,0.5)]"
                  />
                </div>

                {/* Cardinal Diamond Markers */}
                <span className="absolute -top-1 h-1.5 w-1.5 rotate-45 bg-[#F2A900] shadow-[0_0_6px_#F2A900]" />
                <span className="absolute -bottom-1 h-1.5 w-1.5 rotate-45 bg-[#F2A900] shadow-[0_0_6px_#F2A900]" />
              </div>

              {/* Sculpted House Title */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.9, ease: LUXURY_EASE }}
              >
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl tracking-[0.16em] uppercase text-[#FBF8F3]">
                  House of the{" "}
                  <span className="font-display-italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4A24C] via-[#FFE5A3] to-[#C59B3F] drop-shadow-[0_2px_12px_rgba(242,169,0,0.35)]">
                    Knight
                  </span>
                </h1>
              </motion.div>

              {/* Sub-creed */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.45, duration: 0.8 }}
                className="mt-3 text-[0.62rem] sm:text-[0.7rem] uppercase tracking-[0.32em] text-[#D8D2C6]"
              >
                Extracted in Secret · Composed with Obsession
              </motion.p>
            </div>

            {/* BOTTOM STAGE: High-Precision Progress & Dynamic Stage */}
            <div className="w-full max-w-md flex flex-col items-center">
              {/* Dynamic Status Text */}
              <div className="h-6 flex items-center justify-center overflow-hidden mb-2">
                <motion.p
                  key={currentStage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="font-mono text-[0.65rem] sm:text-xs tracking-[0.22em] text-[#D4A24C] uppercase text-center"
                >
                  {currentStage}
                </motion.p>
              </div>

              {/* Razor-Thin Precision Progress Bar */}
              <div className="relative w-full h-[2px] rounded-full bg-white/10 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#D4A24C] via-[#FFE08A] to-[#F2A900] rounded-full shadow-[0_0_12px_#F2A900]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>

              {/* Progress Numeral & Skip Button */}
              <div className="mt-3 w-full flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-[0.6rem] font-mono tracking-widest uppercase opacity-60">
                  New Delhi · Reserve
                </span>

                <span className="font-mono text-sm sm:text-base font-light tracking-widest text-[#F2A900]">
                  {progress < 10 ? `0${progress}` : progress}
                  <span className="text-[0.65rem] opacity-70 ml-0.5">%</span>
                </span>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-[#D4A24C]/80 hover:text-[#FFE5A3] transition-colors hover:underline"
                >
                  Enter House →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
