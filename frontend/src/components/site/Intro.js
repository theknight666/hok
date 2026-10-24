import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "./Reveal";

const WORDS = ["House", "of the", "Knight"];

export function Intro() {
  const [show, setShow] = useState(() => !sessionStorage.getItem("hotk_intro"));

  useEffect(() => {
    if (!show) return undefined;
    sessionStorage.setItem("hotk_intro", "1");
    const t = setTimeout(() => setShow(false), 1700);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          data-testid="intro-curtain"
          className="fixed inset-0 z-[100] flex items-end bg-[#0C0B0E] px-5 pb-10 text-[#F3EEE5] sm:px-10"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <div>
            {WORDS.map((w, i) => (
              <span key={w} className="block overflow-hidden">
                <motion.span
                  className={`display-xl block ${i === 2 ? "font-display-italic text-[#F2A900]" : "font-display"}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: EASE }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
