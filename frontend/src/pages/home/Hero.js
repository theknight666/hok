import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MaskLines, EASE } from "@/components/site/Reveal";
import { inr } from "@/lib/api";

const FALLBACK = [
  { slug: "blonde-amber", name: "Blonde Amber", color: "#D4A24C", price: 18500, image: "/images/blonde-amber.jpg" },
  { slug: "layton", name: "Layton", color: "#2E4C86", price: 16500, image: "/images/layton.jpg" },
  { slug: "angels-share-on-the-rocks", name: "Angels Share On The Rocks", color: "#B4622A", price: 17500, image: "/images/angels-share.jpg" },
  { slug: "side-effect", name: "Side Effect", color: "#8A2436", price: 16000, image: "/images/side-effect.jpg" },
];

export function Hero({ products }) {
  const list = products.length ? products : FALLBACK;
  const [active, setActive] = useState(0);
  const cur = list[active] || list[0];
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "42%"]);
  const stageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden pt-[72px]" data-testid="hero-section">
      <div className="spotlight pointer-events-none absolute inset-0" />
      <motion.p
        style={{ y: bgY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.4 }}
        className="pointer-events-none absolute inset-x-0 top-[20%] select-none whitespace-nowrap text-center font-display text-[26vw] leading-none tracking-tight text-outline lg:top-[14%] lg:text-[19vw]"
        aria-hidden="true"
      >
        Knight
      </motion.p>

      <div className="relative mx-auto grid max-w-[1500px] grid-cols-1 px-5 sm:px-10 lg:min-h-[calc(100svh-72px)] lg:grid-cols-12">
        <div className="z-10 order-2 flex flex-col justify-end pb-10 lg:order-1 lg:col-span-4 lg:pb-24">
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}>
            House of the Knight · Haute Parfumerie
          </motion.p>
          <MaskLines
            lines={["Armour", "for the", <em key="s" className="gold-gradient not-italic">senses.</em>]}
            delay={0.5}
            className="mt-6 font-display text-6xl font-light leading-[0.92] tracking-tight sm:text-7xl lg:text-[6.4rem]"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1, ease: EASE }}
            className="mt-8 max-w-sm text-base leading-relaxed text-muted-foreground"
          >
            Four signatures composed for those who carry themselves with quiet command. Choose your crest and wear the House.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }} className="mt-10 flex flex-wrap gap-4">
            <Link to="/#collection" className="btn-royal" data-testid="hero-shop-btn">
              <span>Discover the collection</span>
            </Link>
          </motion.div>
        </div>

        <motion.div style={{ y: stageY }} className="relative order-1 flex h-[64svh] items-center justify-center lg:order-2 lg:col-span-5 lg:h-auto">
          {/* accent halo bloom */}
          <motion.div
            key={`halo-${cur.slug}`}
            className="halo pointer-events-none absolute left-1/2 top-1/2 h-[clamp(340px,40vw,560px)] w-[clamp(340px,40vw,560px)] -translate-x-1/2 -translate-y-1/2 opacity-50"
            style={{ "--halo": cur.color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1.4, ease: EASE }}
          />
          <motion.div style={{ scale: stageScale }} className="animate-floaty relative z-[1]">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.3 }}
              className="lux-frame grain relative aspect-[3/4] w-[min(72vw,380px)] overflow-hidden bg-card"
              data-testid="hero-bottle-stage"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={cur.slug}
                  src={cur.image}
                  alt={cur.name}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <span className="bg-background/85 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.28em] backdrop-blur">
                  Extrait · 100ml
                </span>
                <span className="font-display text-2xl text-white drop-shadow" data-testid="hero-active-price">{inr(cur.price)}</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="z-10 order-3 flex flex-col justify-end pb-16 lg:col-span-3 lg:pb-24">
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5, duration: 1.1, ease: EASE }}>
            <p className="eyebrow">Choose your signature</p>
            <ul className="mt-5 divide-y border-y">
              {list.map((p, i) => (
                <li key={p.slug}>
                  <button
                    onClick={() => setActive(i)}
                    data-testid={`hero-swatch-${p.slug}`}
                    className={`group flex w-full items-center gap-4 py-4 text-left transition-colors duration-300 ${i === active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className="h-3 w-3 shrink-0 rounded-full ring-1 ring-offset-2 ring-offset-background transition-transform duration-500 group-hover:scale-125" style={{ background: p.color, "--tw-ring-color": i === active ? p.color : "transparent" }} />
                    <span className="flex-1 font-display text-xl leading-tight">{p.name}</span>
                    {p.price ? <span className="text-xs tabular-nums">{inr(p.price)}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
            <Link to={`/fragrance/${cur.slug}`} data-testid="hero-discover-active" className="mt-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
              <span className="link-line">Discover {cur.name}</span> <ArrowRight className="h-4 w-4" strokeWidth={1.3} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
