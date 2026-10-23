import { motion } from "framer-motion";

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
            transition={{ duration: 1.3, ease: EASE, delay: delay + i * 0.12 }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

export const FadeUp = ({ children, delay = 0, className = "", y = 36 }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.12 }}
    transition={{ duration: 1.1, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);
