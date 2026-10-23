import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MaskLines, EASE } from "@/components/site/Reveal";

export function NotesPyramid({ notes, color }) {
  const tiers = [
    ["Top", notes?.top, "The opening · first minutes"],
    ["Heart", notes?.heart, "The character · first hours"],
    ["Base", notes?.base, "The legacy · lasting trail"],
  ];
  return (
    <div className="divide-y border-y" data-testid="notes-pyramid">
      {tiers.map(([label, list, sub], i) => (
        <div key={label} className="grid grid-cols-12 items-start gap-4 py-6">
          <div className="col-span-12 sm:col-span-4">
            <p className="font-display text-2xl">{label} notes</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{sub}</p>
          </div>
          <div className="col-span-12 flex flex-wrap gap-2 sm:col-span-8">
            {(Array.isArray(list) ? list : []).map((n, k) => (
              <motion.span
                key={n}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.1 + k * 0.05, duration: 0.7, ease: EASE }}
                className="border px-4 py-2 text-sm"
                style={{ borderColor: `${color}66` }}
              >
                {n}
              </motion.span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotesAtlas({ products }) {
  const [i, setI] = useState(0);
  const p = products[i];
  if (!p) return null;
  return (
    <section id="notes" className="mx-auto max-w-[1500px] px-5 py-28 sm:px-10 lg:py-40" data-testid="notes-section">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">The Notes Atlas</p>
          <MaskLines as="h2" inView lines={["Read the", <em key="a" className="text-gold">anatomy</em>, "of a scent."]} className="mt-5 font-display text-5xl font-light leading-[0.95] sm:text-6xl" />
          <div className="mt-12 flex flex-col">
            {products.map((x, k) => (
              <button
                key={x.slug}
                onClick={() => setI(k)}
                data-testid={`notes-tab-${x.slug}`}
                className={`group flex items-center justify-between border-b py-5 text-left transition-colors duration-300 ${k === i ? "" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className="flex items-center gap-5">
                  <span className="font-display text-sm italic text-gold">0{k + 1}</span>
                  <span className="font-display text-2xl sm:text-3xl">{x.name}</span>
                </span>
                <span className="h-2 w-2 rounded-full transition-transform duration-500" style={{ background: x.color, transform: k === i ? "scale(2)" : "scale(1)" }} />
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <motion.div key={p.slug} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
            <div className="flex items-end justify-between gap-6">
              <p className="max-w-md font-display text-3xl italic leading-snug">“{p.tagline}”</p>
              <Link to={`/fragrance/${p.slug}`} className="grid h-14 w-14 shrink-0 place-items-center rounded-full border transition-colors duration-300 hover:border-gold hover:text-gold" data-testid="notes-open-product" aria-label={`Open ${p.name}`}>
                <ArrowUpRight className="h-5 w-5" strokeWidth={1.2} />
              </Link>
            </div>
            <div className="mt-10">
              <NotesPyramid notes={p.notes} color={p.color} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
