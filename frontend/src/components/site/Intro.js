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
          {/* WATERMARK: Subterranean Light Stripe with Upward Rays    */}
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

              {/* Layer 2: Text Catching Upward Amber Rays (Masked: Base Only, Top Stays Dark) */}
              <p
                className="pointer-events-none absolute inset-0 w-full text-center font-display font-black leading-[0.88] tracking-tight whitespace-nowrap text-[13.85vw] select-none transform-gpu"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, transparent 34%, rgba(245, 150, 15, 0.04) 41%, rgba(255, 140, 25, 0.26) 47%, rgba(255, 185, 65, 0.46) 50%, rgba(255, 140, 25, 0.26) 53%, rgba(245, 150, 15, 0.04) 59%, transparent 66%, transparent 100%)",
                  backgroundSize: "260% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  WebkitMaskImage:
                    "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 24%, rgba(0,0,0,0.15) 50%, transparent 72%)",
                  maskImage:
                    "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 24%, rgba(0,0,0,0.15) 50%, transparent 72%)",
                  filter: "blur(14px) sm:blur(18px)",
                  opacity: 0.95,
                  animation:
                    "watermarkLivingGlow 3.6s cubic-bezier(0.35, 0, 0.25, 1) infinite",
                }}
              >
                House of the Knight
              </p>

              {/* Layer 3: Subterranean Light Stripe Running Below the Screen Edge */}
              <div
                className="pointer-events-none absolute -bottom-6 inset-x-0 h-10 select-none transform-gpu"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, transparent 35%, rgba(245, 150, 15, 0.03) 42%, rgba(255, 140, 25, 0.22) 48%, rgba(255, 185, 65, 0.42) 50%, rgba(255, 140, 25, 0.22) 52%, rgba(245, 150, 15, 0.03) 58%, transparent 65%, transparent 100%)",
                  backgroundSize: "260% 100%",
                  filter: "blur(22px) sm:blur(30px)",
                  opacity: 0.7,
                  animation:
                    "watermarkLivingGlow 3.6s cubic-bezier(0.35, 0, 0.25, 1) infinite",
                }}
              />
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* CENTERPIECE: 40% Smaller Logo (Raised Above Center)      */}
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
                    scale: [1, 1.32, 1],
                    transition: {
                      scale: {
                        duration: 1.32,
                        times: [0, 0.025, 1],
                        ease: ["easeOut", [0.16, 1, 0.3, 1]],
                      },
                    },
                  }
                : { opacity: 1, scale: 1 }
            }
            transition={{ opacity: { duration: 0.18 } }}
            className="relative z-10 flex items-center justify-center p-6 will-change-transform -translate-y-10 sm:-translate-y-14 lg:-translate-y-16"
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
                  {/* Primary Ghost After-Image Zoom Echo (Slow Ethereal Dissolve) */}
                  <motion.img
                    src="/images/hok-monogram.png"
                    alt=""
                    aria-hidden="true"
                    initial={{ scale: 1, opacity: 0.88 }}
                    animate={{ scale: 2.65, opacity: 0 }}
                    transition={{
                      duration: 1.25,
                      ease: [0.14, 1, 0.28, 1],
                    }}
                    style={{
                      filter: "grayscale(100%) brightness(0.72) contrast(1.05)",
                      pointerEvents: "none",
                    }}
                    className="absolute inset-0 z-0 h-full w-full object-contain select-none pointer-events-none transform-gpu origin-center"
                    draggable={false}
                  />

                  {/* Secondary Subtle After-Image Ripple (Slow Extended Echo) */}
                  <motion.img
                    src="/images/hok-monogram.png"
                    alt=""
                    aria-hidden="true"
                    initial={{ scale: 1, opacity: 0.50 }}
                    animate={{ scale: 3.35, opacity: 0 }}
                    transition={{
                      duration: 1.50,
                      delay: 0.04,
                      ease: [0.14, 1, 0.28, 1],
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
