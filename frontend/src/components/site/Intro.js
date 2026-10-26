import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const LUXURY_EASE = [0.83, 0, 0.17, 1];

export function Intro() {
  // Always show preloader on every page reload per user instruction (will revert when user texts "revert")
  const [show, setShow] = useState(true);
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

    // 1. Trigger single ultra-fast beat + after-image ghost zoom quickly at 0.25s (no awkward delay)
    const beatTimer = setTimeout(() => {
      setIsBeating(true);
    }, 250);

    // 2. Conclude preloader smoothly at 1.85s: lift curtain with logo remaining fully visible
    const exitTimer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        document.body.style.overflow = prevOverflow;
      }, 950);
    }, 1850);

    return () => {
      clearTimeout(beatTimer);
      clearTimeout(exitTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [show]);

  const handleDismiss = () => {
    setShow(false);
    setTimeout(() => {
      document.body.style.overflow = "";
    }, 950);
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

          {/* Inline Hardware-Accelerated Smooth Sweep Keyframes */}
          <style>{`
            @keyframes watermarkLivingGlow {
              0% {
                background-position: 140% 0;
              }
              100% {
                background-position: -40% 0;
              }
            }
          `}</style>

          {/* ======================================================== */}
          {/* WATERMARK: Pure Letter Bases Catching Upward Amber Rays */}
          {/* ======================================================== */}
          <motion.div
            style={{
              x: watermarkX,
              y: watermarkY,
            }}
            className="pointer-events-none absolute inset-x-0 bottom-0 pb-1 sm:pb-2 lg:pb-3 flex items-end justify-center select-none will-change-transform w-full overflow-visible"
            aria-hidden="true"
          >
            <div className="relative w-full flex items-center justify-center text-center overflow-visible">
              {/* Layer 1: Base Subtle Edge-to-Edge Watermark Typography */}
              <p className="w-full text-center font-display font-black leading-[0.88] tracking-tight whitespace-nowrap text-[13.85vw] text-[#FBF8F3]/[0.05] select-none">
                House of the Knight
              </p>

              {/* Layer 2: Bottom-Anchored Radial Amber Hue (Whisper-Quiet Subtle Glow) */}
              <p
                className="pointer-events-none absolute inset-0 w-full text-center font-display font-black leading-[0.88] tracking-tight whitespace-nowrap text-[13.85vw] select-none transform-gpu"
                style={{
                  background:
                    "radial-gradient(ellipse 48% 85% at 50% 100%, rgba(255, 180, 60, 0.16) 0%, rgba(255, 140, 20, 0.07) 30%, rgba(245, 145, 15, 0.015) 55%, transparent 75%)",
                  backgroundSize: "260% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "blur(16px) sm:blur(22px)",
                  opacity: 0.75,
                  animation:
                    "watermarkLivingGlow 3.6s cubic-bezier(0.35, 0, 0.25, 1) infinite",
                }}
              >
                House of the Knight
              </p>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* CENTERPIECE: 40% Smaller Logo (Decisively Raised Up)     */}
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
              isBeating
                ? {
                    opacity: 1,
                    scale: [1, 1.35, 1],
                    transition: {
                      scale: {
                        duration: 1.35,
                        times: [0, 0.015, 1],
                        ease: ["easeOut", [0.16, 1, 0.3, 1]],
                      },
                    },
                  }
                : { opacity: 1, scale: 1 }
            }
            transition={{ opacity: { duration: 0.18 } }}
            className="relative z-10 flex items-center justify-center p-6 will-change-transform -translate-y-[15vh] sm:-translate-y-[18vh] lg:-translate-y-[20vh]"
          >
            <div className="relative h-[4.25rem] w-[4.25rem] sm:h-[5.25rem] sm:w-[5.25rem] lg:h-24 lg:w-24 flex items-center justify-center transform-gpu">
              {/* Primary Grey Monogram Logo (40% Smaller) */}
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
                  {/* Primary Ghost After-Image Zoom Echo (Greater Distance Travel) */}
                  <motion.img
                    src="/images/hok-monogram.png"
                    alt=""
                    aria-hidden="true"
                    initial={{ scale: 1, opacity: 0.88 }}
                    animate={{ scale: 3.4, opacity: 0 }}
                    transition={{
                      duration: 1.4,
                      ease: [0.12, 1, 0.25, 1],
                    }}
                    style={{
                      filter: "grayscale(100%) brightness(0.72) contrast(1.05)",
                      pointerEvents: "none",
                    }}
                    className="absolute inset-0 z-0 h-full w-full object-contain select-none pointer-events-none transform-gpu origin-center"
                    draggable={false}
                  />

                  {/* Secondary Subtle After-Image Ripple (Extended Cosmic Travel) */}
                  <motion.img
                    src="/images/hok-monogram.png"
                    alt=""
                    aria-hidden="true"
                    initial={{ scale: 1, opacity: 0.50 }}
                    animate={{ scale: 4.4, opacity: 0 }}
                    transition={{
                      duration: 1.65,
                      delay: 0.04,
                      ease: [0.12, 1, 0.25, 1],
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
