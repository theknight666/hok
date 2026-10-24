import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

export const MaskLines = ({ lines, className = "", delay = 0, as = "h1", lineClass = "", inView = false }) => {
  const Tag = motion[as] || motion.h1;
  const trigger = inView
    ? { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.1 } }
    : { initial: "hidden", animate: "show" };
  return (
    <Tag className={className} {...trigger}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className={`block ${lineClass}`}
            variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.1 }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

export const FadeUp = ({ children, delay = 0, className = "", y = 36, ...rest }) => (
  <motion.div
    className={`${className} will-change-transform`}
    {...rest}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.12 }}
    transition={{ duration: 0.85, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

/** Letter-by-letter spaced headline that rises in on view (Bucks-style "C h o o s e"). */
export const SplitChars = ({ text, className = "", as = "h2", delay = 0 }) => {
  const Tag = motion[as] || motion.h2;
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} aria-label={text}>
      {text.split("").map((c, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]" aria-hidden="true">
          <motion.span
            className="inline-block will-change-transform"
            variants={{ hidden: { y: "110%", rotate: 6 }, show: { y: "0%", rotate: 0 } }}
            transition={{ duration: 0.85, ease: EASE, delay: delay + i * 0.025 }}
          >
            {c === " " ? "\u00A0" : c}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

const Word = ({ w, range, progress }) => {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <span className="mr-[0.26em] inline-block">
      <motion.span style={{ opacity, y }} className="inline-block will-change-transform">{w}</motion.span>
    </span>
  );
};

/** Scroll-scrubbed paragraph: each word brightens as it crosses the viewport. */
export const ScrollWords = ({ text, className = "" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} w={w} range={[i / words.length, (i + 1) / words.length]} progress={scrollYProgress} />
      ))}
    </p>
  );
};
