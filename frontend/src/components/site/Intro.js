import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const LUXURY_EASE = [0.83, 0, 0.17, 1];

export function Intro() {
  // Always show preloader on every page reload per user instruction (will revert when user texts "revert")
  const [show, setShow] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const containerRef = useRef(null);

  // -------------------------------------------------------------
  // DIRECTION 2: Interactive 3D Spatial Parallax
  // -------------------------------------------------------------
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Damped luxury spring physics (weighted, fluid, ultra-smooth)
  const springConfig = { damping: 26, stiffness: 110, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Layer 1: Deep Watermark Parallax (counter-shift for depth)
  const watermarkX = useTransform(smoothX, [-0.5, 0.5], [12, -12]);
  const watermarkY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  // Layer 2: Volumetric Ambient Caustic Hue (follows light focal point)
  const hueX = useTransform(smoothX, [-0.5, 0.5], [-38, 38]);
  const hueY = useTransform(smoothY, [-0.5, 0.5], [-38, 38]);

  // Layer 3: Foreground Logo 3D Tilt & Parallax
  const logoX = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const logoY = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);
  const logoRotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);
  const logoRotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);

  // Dynamic Shadow Offset counter-reacting to cursor angle
  const shadowX = useTransform(smoothX, [-0.5, 0.5], [16, -16]);
  const shadowY = useTransform(smoothY, [-0.5, 0.5], [16, -16]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { innerWidth, innerHeight } = window;
    const normX = e.clientX / innerWidth - 0.5;
    const normY = e.clientY / innerHeight - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);
  };

  useEffect(() => {
    if (!show) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-dismiss after stately 2.0s pause
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setShow(false);
        document.body.style.overflow = prevOverflow;
      }, 500);
    }, 2000);

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
          ref={containerRef}
          key="minimalist-luxury-preloader-v2"
          data-testid="intro-curtain"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.95, ease: LUXURY_EASE }}
          onMouseMove={handleMouseMove}
          onClick={handleDismiss}
          style={{ perspective: 1200 }}
          className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden bg-[#0A080D] flex items-center justify-center will-change-transform transform-gpu shadow-[0_30px_90px_rgba(0,0,0,0.95)] cursor-pointer"
        >
          {/* ======================================================== */}
          {/* LAYER 2: MID-GROUND VOLUMETRIC CAUSTIC AMBER HUE         */}
          {/* ======================================================== */}
          <motion.div
            style={{
              x: hueX,
              y: hueY,
              background:
                "radial-gradient(circle at center, rgba(242, 169, 0, 0.34) 0%, rgba(201, 71, 27, 0.16) 45%, rgba(10,8,13,0) 74%)",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: isExiting ? 0 : 1,
              scale: [0.96, 1.05, 0.96],
            }}
            transition={{
              opacity: { duration: 0.7 },
              scale: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] sm:h-[760px] sm:w-[760px] rounded-full blur-[140px] will-change-transform"
            aria-hidden="true"
          />

          {/* Analog Luxury Texture Grain */}
          <div className="grain pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

          {/* ======================================================== */}
          {/* LAYER 1: DEEP WATERMARK (House of the Knight)            */}
          {/* ======================================================== */}
          <motion.div
            style={{
              x: watermarkX,
              y: watermarkY,
            }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none will-change-transform"
            aria-hidden="true"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-full text-center font-display font-bold leading-[0.92] tracking-tight whitespace-nowrap text-[13.6vw] sm:text-[13.7vw] lg:text-[13.8vw] text-[#FBF8F3]/[0.055]"
            >
              House of the Knight
            </motion.p>
          </motion.div>

          {/* ======================================================== */}
          {/* LAYER 3: FOREGROUND 3D TACTILE GOLD MONOGRAM LOGO        */}
          {/* ======================================================== */}
          <motion.div
            style={{
              x: logoX,
              y: logoY,
              rotateX: logoRotateX,
              rotateY: logoRotateY,
              transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{
              opacity: isExiting ? 0 : 1,
              scale: isExiting ? 1.08 : [0.98, 1.02, 0.98],
            }}
            transition={{
              opacity: { duration: 0.6 },
              scale: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative z-10 flex items-center justify-center p-6 will-change-transform"
          >
            {/* Dynamic Physical Floor Shadow Offset */}
            <motion.div
              style={{
                x: shadowX,
                y: shadowY,
              }}
              className="pointer-events-none absolute inset-0 rounded-full bg-[#F2A900]/15 blur-2xl filter -z-10"
            />

            <div className="relative h-28 w-28 sm:h-36 sm:w-36 lg:h-40 lg:w-40 flex items-center justify-center transform-gpu">
              <img
                src="/images/hok-monogram.png"
                alt="House of the Knight"
                className="h-full w-full object-contain filter drop-shadow-[0_0_28px_rgba(212,162,76,0.65)] select-none pointer-events-none"
                draggable={false}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
