import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const LUXURY_EASE = [0.83, 0, 0.17, 1];

export function Intro() {
  const themeContext = useTheme();
  const isDark = themeContext ? themeContext.theme === "dark" : false;

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

    // Lock scroll smoothly without toggling overflow on body (eliminates scrollbar layout shift)
    if (window.__lenis) {
      window.__lenis.stop();
    }

    // 1. Trigger single ultra-fast beat + after-image ghost zoom quickly at 0.25s (no awkward delay)
    const beatTimer = setTimeout(() => {
      setIsBeating(true);
    }, 250);

    // 2. Conclude preloader smoothly at 1.85s: lift curtain with logo remaining fully visible
    const exitTimer = setTimeout(() => {
      setShow(false);
    }, 1850);

    return () => {
      clearTimeout(beatTimer);
      clearTimeout(exitTimer);
      if (window.__lenis) {
        window.__lenis.start();
      }
    };
  }, [show]);

  const handleDismiss = () => {
    setShow(false);
    if (window.__lenis) {
      window.__lenis.start();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          ref={containerRef}
          key={`minimalist-luxury-${isDark ? "dark" : "light"}-preloader-slab`}
          data-testid="intro-curtain"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.95, ease: LUXURY_EASE }}
          onMouseMove={handleMouseMove}
          onClick={handleDismiss}
          onAnimationComplete={(definition) => {
            if (definition === "exit" || !show) {
              if (window.__lenis) {
                window.__lenis.start();
              }
            }
          }}
          style={{
            perspective: 1200,
            backgroundColor: isDark ? "#000000" : "#FFFFFF",
            boxShadow: isDark
              ? "0 14px 28px -4px rgba(0, 0, 0, 0.95), 0 35px 70px -8px rgba(0, 0, 0, 0.98), 0 85px 170px -16px rgba(0, 0, 0, 1), inset 0 2px 2px rgba(255, 255, 255, 0.14), inset 0 -4px 10px rgba(255, 255, 255, 0.05), inset 0 0 90px rgba(0, 0, 0, 0.6)"
              : "0 14px 28px -4px rgba(0, 0, 0, 0.16), 0 35px 70px -8px rgba(0, 0, 0, 0.24), 0 85px 170px -16px rgba(0, 0, 0, 0.32), inset 0 2px 2px rgba(255, 255, 255, 1), inset 0 -5px 12px rgba(0, 0, 0, 0.10), inset 0 0 90px rgba(0, 0, 0, 0.025)",
          }}
          className={`fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden rounded-b-[34px] sm:rounded-b-[42px] lg:rounded-b-[50px] border-b-2 border-x ${
            isDark ? "border-white/[0.08]" : "border-black/[0.08]"
          } flex items-center justify-center will-change-transform transform-gpu cursor-pointer`}
        >
          {/* The First Royal Heraldic Damask & Trellis Texture with Lightening Bottom Gradient */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.68) 55%, rgba(0,0,0,0.38) 78%, rgba(0,0,0,0.18) 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.68) 55%, rgba(0,0,0,0.38) 78%, rgba(0,0,0,0.18) 100%)",
            }}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              {/* Native SVG Mask fallback for continuous gradient lightening */}
              <linearGradient id="royalTextureFadeMaskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="30%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.68" />
                <stop offset="78%" stopColor="#FFFFFF" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.18" />
              </linearGradient>
              <mask id="royalTextureFadeMask">
                <rect width="100%" height="100%" fill="url(#royalTextureFadeMaskGrad)" />
              </mask>

              <pattern
                id="royalHeraldicPattern"
                width="72"
                height="72"
                patternUnits="userSpaceOnUse"
              >
                {/* Royal Trellis Diamond Lattice */}
                <path
                  d="M36 0 L72 36 L36 72 L0 36 Z"
                  fill="none"
                  stroke={isDark ? "#141414" : "#F5F5F5"}
                  strokeWidth="0.85"
                />

                {/* Alternating Diamond Center Florets */}
                <circle cx="0" cy="0" r="2.2" fill={isDark ? "#141414" : "#F5F5F5"} />
                <circle cx="72" cy="0" r="2.2" fill={isDark ? "#141414" : "#F5F5F5"} />
                <circle cx="0" cy="72" r="2.2" fill={isDark ? "#141414" : "#F5F5F5"} />
                <circle cx="72" cy="72" r="2.2" fill={isDark ? "#141414" : "#F5F5F5"} />

                {/* Authentic Royal Spade (♠) Perfectly Centered at (36, 36) */}
                <path
                  d="M 36 25 C 38 28, 44.5 32, 44.5 36.5 C 44.5 40.5, 41 42, 37.5 40.5 C 36.8 40, 36.2 39.5, 36.2 39 C 36.5 41.5, 38 44.5, 39.5 46 L 32.5 46 C 34 44.5, 35.5 41.5, 35.8 39 C 35.8 39.5, 35.2 40, 34.5 40.5 C 31 42, 27.5 40.5, 27.5 36.5 C 27.5 32, 34 28, 36 25 Z"
                  fill={isDark ? "#141414" : "#F5F5F5"}
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#royalHeraldicPattern)"
              mask="url(#royalTextureFadeMask)"
            />
          </svg>

          {/* Physical 3D Architectural Slab Bottom Thickness Bevel */}
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-2.5 rounded-b-[34px] sm:rounded-b-[42px] lg:rounded-b-[50px] ${
              isDark
                ? "bg-gradient-to-t from-white/[0.08] to-transparent"
                : "bg-gradient-to-t from-black/[0.04] to-transparent"
            }`}
            aria-hidden="true"
          />

          {/* ======================================================== */}
          {/* WATERMARK: 3-4 Shades Shifted Stealth Typography         */}
          {/* ======================================================== */}
          <motion.div
            style={{
              x: watermarkX,
              y: watermarkY,
            }}
            className="pointer-events-none absolute inset-x-0 bottom-0 pb-3 sm:pb-5 lg:pb-6 flex items-end justify-center select-none will-change-transform w-full overflow-hidden"
            aria-hidden="true"
          >
            <p
              style={{ color: isDark ? "#0A0A0A" : "#F7F7F7" }}
              className="w-full text-center font-display font-black leading-[0.88] tracking-tight whitespace-nowrap text-[13.85vw] select-none"
            >
              House of the Knight
            </p>
          </motion.div>

          {/* ======================================================== */}
          {/* CENTERPIECE: Anchored in Red Scribbled Space (36.6% Top) */}
          {/* ======================================================== */}
          <div
            style={{
              position: "absolute",
              top: "36.6%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            className="z-10 flex items-center justify-center pointer-events-none"
          >
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
              className="relative flex items-center justify-center p-6 will-change-transform"
            >
              <div className="relative h-[6.8rem] w-[6.8rem] sm:h-[8.4rem] sm:w-[8.4rem] lg:h-[9.6rem] lg:w-[9.6rem] flex items-center justify-center transform-gpu">
                {/* Primary Monogram Logo: Grey on Dark mode, Dark Obsidian on White mode */}
                <img
                  src={isDark ? "/images/hok-monogram.png" : "/images/hok-monogram-dark.png"}
                  alt="House of the Knight"
                  style={{
                    filter: isDark
                      ? "grayscale(100%) brightness(0.72) contrast(1.05) drop-shadow(0 14px 28px rgba(0, 0, 0, 0.95)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.8))"
                      : "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.18)) drop-shadow(0 3px 8px rgba(0, 0, 0, 0.10))",
                    opacity: 0.92,
                  }}
                  className="relative z-10 h-full w-full object-contain select-none pointer-events-none"
                  draggable={false}
                />

                {/* Ghost After-Image Zooming Outward at the Fast Beat Expansion */}
                {isBeating && (
                  <>
                    {/* Primary Ghost After-Image Zoom Echo */}
                    <motion.img
                      src={isDark ? "/images/hok-monogram.png" : "/images/hok-monogram-dark.png"}
                      alt=""
                      aria-hidden="true"
                      initial={{ scale: 1, opacity: isDark ? 0.85 : 0.42 }}
                      animate={{ scale: 3.4, opacity: 0 }}
                      transition={{
                        duration: 1.4,
                        ease: [0.12, 1, 0.25, 1],
                      }}
                      style={{
                        filter: isDark ? "grayscale(100%) brightness(0.75) contrast(1.05)" : "none",
                        pointerEvents: "none",
                      }}
                      className="absolute inset-0 z-0 h-full w-full object-contain select-none pointer-events-none transform-gpu origin-center"
                      draggable={false}
                    />

                    {/* Secondary Subtle After-Image Ripple */}
                    <motion.img
                      src={isDark ? "/images/hok-monogram.png" : "/images/hok-monogram-dark.png"}
                      alt=""
                      aria-hidden="true"
                      initial={{ scale: 1, opacity: isDark ? 0.48 : 0.22 }}
                      animate={{ scale: 4.4, opacity: 0 }}
                      transition={{
                        duration: 1.65,
                        delay: 0.04,
                        ease: [0.12, 1, 0.25, 1],
                      }}
                      style={{
                        filter: isDark ? "grayscale(100%) brightness(0.68) contrast(1.05)" : "none",
                        pointerEvents: "none",
                      }}
                      className="absolute inset-0 z-0 h-full w-full object-contain select-none pointer-events-none transform-gpu origin-center"
                      draggable={false}
                    />
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
