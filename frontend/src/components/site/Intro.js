import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KnightMark } from "./Logo";
import { EASE } from "./Reveal";

export function Intro() {
  const [show, setShow] = useState(() => !sessionStorage.getItem("hotk_intro"));

  useEffect(() => {
    if (!show) return undefined;
    sessionStorage.setItem("hotk_intro", "1");
    const t = setTimeout(() => setShow(false), 1900);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          data-testid="intro-curtain"
          className="fixed inset-0 z-[100] grid place-items-center bg-[#0E0C0A] text-[#E9D7AE]"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <div className="flex flex-col items-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: EASE }}>
              <KnightMark className="h-16 w-16" />
            </motion.div>
            <div className="mt-6 overflow-hidden">
              <motion.p
                className="font-display text-2xl uppercase tracking-[0.5em]"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: EASE }}
              >
                House of the Knight
              </motion.p>
            </div>
            <motion.div className="mt-6 h-px bg-[#C9A45C]" initial={{ width: 0 }} animate={{ width: 180 }} transition={{ duration: 1.4, delay: 0.2, ease: EASE }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
