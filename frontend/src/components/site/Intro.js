import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LUXURY_EASE = [0.83, 0, 0.17, 1];

export function Intro() {
  // Always show preloader on every page reload per user instruction (will revert when user texts "revert")
  const [show, setShow] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!show) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-dismiss after pure, stately 1.8s pause
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setShow(false);
        document.body.style.overflow = prevOverflow;
      }, 500);
    }, 1800);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
    };
  }, [show]);

  const handleDismiss = () => {
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
          key="minimalist-luxury-preloader"
          data-testid="intro-curtain"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.95, ease: LUXURY_EASE }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden bg-[#0A080D] flex items-center justify-center will-change-transform transform-gpu shadow-[0_30px_90px_rgba(0,0,0,0.95)] cursor-pointer"
        >
          {/* ======================================================== */}
          {/* THE HUE IN THE BACK: Volumetric Caustic Glow & Grain     */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: isExiting ? 0 : 1,
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              opacity: { duration: 0.7 },
              scale: { duration: 3.8, repeat: Infinity, ease: "easeInOut" },
            }}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] sm:h-[720px] sm:w-[720px] rounded-full blur-[140px]"
            style={{
              background: "radial-gradient(circle, rgba(242, 169, 0, 0.32) 0%, rgba(201, 71, 27, 0.16) 45%, rgba(10,8,13,0) 75%)",
            }}
            aria-hidden="true"
          />

          {/* Analog Film Grain */}
          <div className="grain pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

          {/* ======================================================== */}
          {/* WATERMARK: House of the Knight across the background     */}
          {/* ======================================================== */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
            aria-hidden="true"
          >
            <p className="w-full text-center font-display font-bold leading-[0.92] tracking-tight whitespace-nowrap text-[13.6vw] sm:text-[13.7vw] lg:text-[13.8vw] text-[#FBF8F3]/[0.06]">
              House of the Knight
            </p>
          </div>

          {/* ======================================================== */}
          {/* CENTER: Logo Only                                        */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{
              opacity: isExiting ? 0 : 1,
              scale: isExiting ? 1.06 : [0.98, 1.02, 0.98],
            }}
            transition={{
              opacity: { duration: 0.6 },
              scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative z-10 flex items-center justify-center p-6"
          >
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 lg:h-36 lg:w-36 flex items-center justify-center">
              <img
                src="/images/hok-monogram.png"
                alt="House of the Knight"
                className="h-full w-full object-contain filter drop-shadow-[0_0_24px_rgba(212,162,76,0.6)]"
                draggable={false}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
