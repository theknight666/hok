import { motion } from "framer-motion";
import { EASE } from "@/components/site/Reveal";

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
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{sub}</p>
          </div>
          <div className="col-span-12 flex flex-wrap gap-2 sm:col-span-8">
            {(Array.isArray(list) ? list : []).map((n, k) => (
              <motion.span
                key={n}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.1 + k * 0.05, duration: 0.7, ease: EASE }}
                className="rounded-full border-2 px-4 py-1.5 text-sm font-semibold"
                style={{ borderColor: color }}
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
