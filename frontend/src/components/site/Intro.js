import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const LUXURY_EASE = [0.83, 0, 0.17, 1];

export function Intro() {
  // Always show preloader on every page reload per user instruction (will revert when user texts "revert")
  const [show, setShow] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isBeating, setIsBeating] = useState(false);
  const containerRef = useRef(null);

  // -------------------------------------------------------------
  // Interactive 3D Spatial Parallax (Direction 2)
  // -------------------------------------------------------------
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Damped luxury spring physics
  const springConfig = { damping: 26, stiffness: 110, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Layer 1: Deep Watermark Parallax
  const watermarkX = useTransform(smoothX, [-0.5, 0.5], [12, -12]);
  const watermarkY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  // Foreground Logo 3D Tilt & Parallax
  const logoX = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const logoY = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);
  const logoRotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);
  const logoRotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);

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

    // 1. Trigger single quick beat + after-image ghost zoom at 0.8s
    const beatTimer = setTimeout(() => {
      setIsBeating(true);
    }, 800);

    // 2. Conclude preloader smoothly after slow contraction and after-image settle (at 1.95s)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setShow(false);
        document.body.style.overflow = prevOverflow;
      }, 500);
    }, 1950);

    return () => {
      clearTimeout(beatTimer);
      clearTimeout(exitTimer);
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
          key="minimalist-luxury-preloader-v3"
          data-testid="intro-curtain"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.95, ease: LUXURY_EASE }}
          onMouseMove={handleMouseMove}
          onClick={handleDismiss}
          style={{ perspective: 1200 }}
          className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden bg-[#0A080D] flex items-center justify-center will-change-transform transform-gpu shadow-[0_30px_90px_rgba(0,0,0,0.95)] cursor-pointer"
        >
          {/* Analog Luxury Texture Grain */}
          <div className="grain pointer-events-none absolute inset-0 opacity-35" aria-hidden="true" />

          {/* ======================================================== */}
          {/* WATERMARK: House of the Knight in Deep Background        */}
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
              transition={{ duration: 0.8 }}
              className="w-full text-center font-display font-bold leading-[0.92] tracking-tight whitespace-nowrap text-[13.6vw] sm:text-[13.7vw] lg:text-[13.8vw] text-[#FBF8F3]/[0.055]"
            >
              House of the Knight
            </motion.p>
          </motion.div>

          {/* ======================================================== */}
          {/* CENTERPIECE: Subtle Grey Monogram with Quick 1 Beat     */}
          {/* ======================================================== */}
          <motion.div
            style={{
              x: logoX,
              y: logoY,
              rotateX: logoRotateX,
              rotateY: logoRotateY,
              transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={
              isExiting
                ? { opacity: 0, scale: 1.06, transition: { duration: 0.35 } }
                : isBeating
                ? {
                    opacity: 1,
                    scale: [1, 1.28, 1],
                    transition: {
                      scale: {
                        duration: 0.88,
                        times: [0, 0.10, 1],
                        ease: ["easeOut", [0.16, 1, 0.3, 1]],
                      },
                    },
                  }
                : { opacity: 1, scale: 1 }
            }
            transition={{ opacity: { duration: 0.5 } }}
            className="relative z-10 flex items-center justify-center p-6 will-change-transform"
          >
            <div className="relative h-28 w-28 sm:h-36 sm:w-36 lg:h-40 lg:w-40 flex items-center justify-center transform-gpu">
              {/* Primary Grey Monogram Logo */}
              <img
                src="/images/hok-monogram.png"
                alt="House of the Knight"
                style={{
                  filter:
                    "grayscale(100%) brightness(0.68) contrast(1.05) drop-shadow(0 6px 20px rgba(0, 0, 0, 0.9))",
                  opacity: 0.86,
                }}
                className="relative z-10 h-full w-full object-contain select-none pointer-events-none"
                draggable={false}
              />

              {/* Ghost After-Image Zooming Outward at the Fast Beat Expansion */}
              {isBeating && (
                <>
                  {/* Primary Ghost After-Image Zoom Echo */}
                  <motion.img
                    src="/images/hok-monogram.png"
                    alt=""
                    aria-hidden="true"
                    initial={{ scale: 1, opacity: 0.85 }}
                    animate={{ scale: 2.45, opacity: 0 }}
                    transition={{
                      duration: 0.82,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      filter: "grayscale(100%) brightness(0.72) contrast(1.05)",
                      pointerEvents: "none",
                    }}
                    className="absolute inset-0 z-0 h-full w-full object-contain select-none pointer-events-none transform-gpu origin-center"
                    draggable={false}
                  />

                  {/* Secondary Subtle After-Image Ripple */}
                  <motion.img
                    src="/images/hok-monogram.png"
                    alt=""
                    aria-hidden="true"
                    initial={{ scale: 1, opacity: 0.45 }}
                    animate={{ scale: 3.1, opacity: 0 }}
                    transition={{
                      duration: 0.95,
                      delay: 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      filter: "grayscale(100%) brightness(0.65) contrast(1.05)",
                      pointerEvents: "none",
                    }}
                    className="absolute inset-0 z-0 h-full w-full object-contain select-none pointer-events-none transform-gpu origin-center"
                    draggable={false}
                  />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
