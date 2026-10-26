import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const LUXURY_EASE = [0.83, 0, 0.17, 1];
const WATERMARK_LETTERS = "House of the Knight".split("");

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

    // 1. Trigger single ultra-fast beat + slow after-image ghost zoom at 0.75s
    const beatTimer = setTimeout(() => {
      setIsBeating(true);
    }, 750);

    // 2. Conclude preloader smoothly at 2.4s: lift curtain with logo remaining fully visible
    const exitTimer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        document.body.style.overflow = prevOverflow;
      }, 950);
    }, 2400);

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

          {/* ======================================================== */}
          {/* WATERMARK: Edge-to-Edge Alphabets with Clean Glow Sweep  */}
          {/* ======================================================== */}
          <motion.div
            style={{
              x: watermarkX,
              y: watermarkY,
            }}
            className="pointer-events-none absolute inset-x-0 bottom-0 pb-1 sm:pb-2 lg:pb-3 flex items-end justify-center select-none will-change-transform w-full overflow-hidden"
            aria-hidden="true"
          >
            <div className="w-full flex items-center justify-center text-center overflow-visible">
              <p className="w-full text-center font-display font-black leading-[0.88] tracking-tight whitespace-nowrap text-[13.85vw] select-none">
                {WATERMARK_LETTERS.map((item, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{
                      color: "rgba(251, 248, 243, 0.055)",
                      textShadow: "0 0 0px transparent",
                    }}
                    animate={{
                      color: [
                        "rgba(251, 248, 243, 0.055)",
                        "rgba(245, 158, 11, 0.22)",
                        "rgba(255, 140, 35, 0.38)",
                        "rgba(245, 158, 11, 0.22)",
                        "rgba(251, 248, 243, 0.055)",
                      ],
                      textShadow: [
                        "0 0 0px rgba(255, 130, 30, 0)",
                        "0 0 12px rgba(245, 150, 20, 0.18), 0 0 25px rgba(225, 110, 15, 0.10)",
                        "0 0 18px rgba(255, 140, 30, 0.32), 0 0 38px rgba(235, 115, 18, 0.18)",
                        "0 0 12px rgba(245, 150, 20, 0.18), 0 0 25px rgba(225, 110, 15, 0.10)",
                        "0 0 0px rgba(255, 130, 30, 0)",
                      ],
                    }}
                    transition={{
                      duration: 1.8,
                      delay: 0.2 + i * 0.075,
                      repeat: Infinity,
                      repeatDelay: 0.8,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    {item === " " ? "\u00A0" : item}
                  </motion.span>
                ))}
              </p>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* CENTERPIECE: Subtle Grey Monogram (Never Disappears)    */}
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
