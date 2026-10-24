import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Bottle } from "@/components/site/Bottle";
import { EASE } from "@/components/site/Reveal";
import { worldOf, worldVars } from "@/lib/visual";
import { inr } from "@/lib/api";

function Cube({ p, i }) {
  const world = worldOf(p);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 16 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 16 });
  const rectRef = useRef(null);

  const onEnter = (e) => {
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };
  const onMove = (e) => {
    const r = rectRef.current || e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    rectRef.current = null;
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 60, rotateX: 18 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, ease: EASE, delay: (i % 4) * 0.08 }}
      style={{ perspective: 1200 }}
      className="will-change-transform"
      data-testid={`cube-${p.slug}`}
    >
      <Link to={`/fragrance/${p.slug}`} className="group block" onMouseEnter={onEnter} onMouseMove={onMove} onMouseLeave={reset} aria-label={`Open ${p.name}`}>
        <motion.div
          style={{ ...worldVars(world), rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", willChange: "transform" }}
          className="grain relative aspect-square overflow-hidden rounded-[1.75rem] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] transform-gpu"
        >
          <span aria-hidden="true" className="pointer-events-none absolute -left-2 top-2 select-none font-display text-[9rem] leading-none opacity-[0.1]">{p.name[0]}</span>
          <span className="absolute left-5 top-5 pill border border-current">{p.badge || "Signature"}</span>
          <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 opacity-70 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100" strokeWidth={1.6} />
          <div className="world-glow pointer-events-none absolute left-1/2 top-[60%] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 will-change-transform" />
          <div className="absolute inset-x-0 bottom-0 flex h-[82%] items-end justify-center pb-4" style={{ transform: "translateZ(40px)" }}>
            <Bottle p={p} className="bottle-shadow h-full w-auto transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-3 group-hover:scale-105 will-change-transform" />
          </div>
          {p.stock <= 0 && <span className="absolute bottom-5 left-5 pill bg-[var(--w-ink)] text-[var(--w-bg)]">Sold out</span>}
        </motion.div>
        <div className="mt-4 flex items-baseline justify-between gap-4 px-1">
          <span className="font-display text-base leading-tight sm:text-lg">{p.name}</span>
          <span className="text-sm font-medium tabular-nums" data-testid={`cube-price-${p.slug}`}>{inr(p.price)}</span>
        </div>
        <p className="mt-1 px-1 text-sm font-light text-muted-foreground line-clamp-1">{p.tagline}</p>
      </Link>
    </motion.li>
  );
}

export function CubeGrid({ products, className = "" }) {
  return (
    <ul className={`grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 ${className}`} data-testid="cube-grid">
      {products.map((p, i) => <Cube key={p.slug} p={p} i={i} />)}
    </ul>
  );
}
