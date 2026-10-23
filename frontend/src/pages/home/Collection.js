import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { MaskLines, EASE } from "@/components/site/Reveal";
import { inr } from "@/lib/api";

const LAYOUT = [
  "lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-12 lg:flex-row",
];

function Card({ p, idx }) {
  const { add } = useCart();
  const wide = idx === 3;
  const sold = p.stock <= 0;
  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 1.1, ease: EASE, delay: (idx % 2) * 0.12 }}
      className={`lux-card group relative flex min-h-[560px] flex-col border bg-card hover:border-gold lg:min-h-0 ${LAYOUT[idx] || "lg:col-span-6"}`}
      data-testid={`product-card-${p.slug}`}
    >
      <Link to={`/fragrance/${p.slug}`} className={`grain relative block flex-1 overflow-hidden ${wide ? "lg:w-1/2 lg:flex-none" : ""}`}>
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          style={{ objectPosition: "50% 42%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: `radial-gradient(60% 50% at 50% 85%, ${p.color}55, transparent 70%)` }} />
        <span className="absolute left-5 top-5 bg-background/85 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.3em] backdrop-blur">
          {p.badge || "Signature"}
        </span>
        <span className="absolute right-5 top-5 font-display text-5xl text-white/90">0{idx + 1}</span>
      </Link>
      <div className={`flex flex-col gap-4 p-6 sm:p-8 ${wide ? "lg:w-1/2 lg:justify-center lg:p-16" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className={`font-display font-normal leading-none ${wide ? "text-4xl lg:text-6xl" : "text-3xl"}`}>{p.name}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{p.tagline}</p>
          </div>
          <span className="whitespace-nowrap font-display text-2xl" data-testid={`product-price-${p.slug}`}>{inr(p.price)}</span>
        </div>
        {wide && (
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">{p.story}</p>
        )}
        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
            {p.concentration} · {p.volume}
          </span>
          <button
            disabled={sold}
            onClick={() => add(p)}
            data-testid={`quick-add-${p.slug}`}
            className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.3em] text-gold transition-opacity hover:opacity-70 disabled:text-muted-foreground"
          >
            {sold ? "Sold out" : (<><Plus className="h-3.5 w-3.5" /> Add to bag</>)}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function Collection({ products }) {
  return (
    <section id="collection" className="mx-auto max-w-[1500px] px-5 py-28 sm:px-10 lg:py-40" data-testid="collection-section">
      <div className="mb-16 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow">The Collection · 04 Signatures</p>
          <MaskLines as="h2" inView lines={["Four crests.", <em key="i" className="text-gold">One bloodline.</em>]} className="mt-5 font-display text-5xl font-light leading-[0.95] sm:text-6xl lg:text-7xl" />
        </div>
        <p className="self-end text-base leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9">
          Each fragrance is a different facet of the same character — warm, noble, spirited and dark. Wear one, or build your armoury.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-[400px_400px_520px]">
        {products.map((p, i) => (
          <Card key={p.slug} p={p} idx={i} />
        ))}
      </div>
    </section>
  );
}
