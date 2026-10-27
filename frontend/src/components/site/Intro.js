import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const LUXURY_EASE = [0.83, 0, 0.17, 1];

export function Intro() {
  const themeContext = useTheme();
  const isDark = themeContext ? themeContext.theme === "dark" : false;

  // Single session preloader: shows once per session (override with ?intro or ?preloader query param)
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("intro") || urlParams.has("preloader")) return true;
    return !sessionStorage.getItem("hotk_intro_v5");
  });
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

    sessionStorage.setItem("hotk_intro_v5", "1");

    // Force scroll to top (0, 0) so the page behind curtain is strictly at the Hero section
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Lock scroll smoothly without toggling overflow on body (eliminates scrollbar layout shift)
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
      window.__lenis.stop();
    }

    // 1. Trigger single ultra-fast beat + after-image ghost zoom quickly at 0.25s (no awkward delay)
    const beatTimer = setTimeout(() => {
      setIsBeating(true);
    }, 250);

    // 2. Conclude preloader smoothly at 1.85s: lift curtain with logo remaining fully visible
    const exitTimer = setTimeout(() => {
      window.scrollTo(0, 0);
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
        window.__lenis.start();
      }
      setShow(false);
    }, 1850);

    return () => {
      clearTimeout(beatTimer);
      clearTimeout(exitTimer);
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
        window.__lenis.start();
      }
    };
  }, [show]);

  const handleDismiss = () => {
    window.scrollTo(0, 0);
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
      window.__lenis.start();
    }
    setShow(false);
    sessionStorage.setItem("hotk_intro_v5", "1");
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
              window.scrollTo(0, 0);
              if (window.__lenis) {
                window.__lenis.scrollTo(0, { immediate: true });
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
          {/* The Royal Heraldic Damask & Trellis Texture Spanning the Full Preloader with Left Corner Text Fade */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{
              maskImage:
                "radial-gradient(ellipse min(520px, 85vw) min(420px, 50vh) at 0% 100%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse min(520px, 85vw) min(420px, 50vh) at 0% 100%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)",
            }}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              {/* Native SVG Mask fallback fading only around the bottom-left corner */}
              <radialGradient id="royalTextureCornerMaskGrad" cx="0" cy="1" r="0.5" fx="0" fy="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.05" />
                <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </radialGradient>
              <mask id="royalTextureFadeMask">
                <rect width="100%" height="100%" fill="url(#royalTextureCornerMaskGrad)" />
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
          {/* WATERMARK: 3-Line Stealth Typography in Left Corner      */}
          {/* ======================================================== */}
          <motion.div
            style={{
              x: watermarkX,
              y: watermarkY,
            }}
            className="pointer-events-none absolute bottom-6 left-6 sm:bottom-8 sm:left-10 lg:bottom-10 lg:left-12 flex items-end justify-start select-none will-change-transform overflow-hidden"
            aria-hidden="true"
          >
            <p
              style={{ color: isDark ? "#222222" : "#D4D4D4" }}
              className="font-display font-black leading-[0.88] tracking-tight text-4xl sm:text-6xl lg:text-7xl select-none text-left"
            >
              <span className="block">House</span>
              <span className="block">of the</span>
              <span className="block">Knight</span>
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
