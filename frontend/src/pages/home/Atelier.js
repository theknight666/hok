import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeUp, MaskLines } from "@/components/site/Reveal";

const STEPS = [
  { n: "I", t: "The Gathering", d: "Raw materials are chosen for character first — resins, woods, spices and spirits that carry weight on the skin." },
  { n: "II", t: "The Composition", d: "Each signature is built in three movements: an opening that commands, a heart that persuades, a base that stays." },
  { n: "III", t: "The Crest", d: "Every bottle is sealed beneath a gilded cap bearing the Knight's helm — the mark of the House." },
];

export function Atelier() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="atelier" ref={ref} className="relative bg-[#0E0C0A] text-[#EFE6D2]" data-testid="atelier-section">
      <div className="mx-auto grid max-w-[1500px] gap-16 px-5 py-28 sm:px-10 lg:grid-cols-12 lg:py-40">
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow !text-[#D9B56A]">The Atelier</p>
            <MaskLines as="h2" inView lines={["Composed", "like a", <em key="o" className="text-[#D9B56A]">coat of arms.</em>]} className="mt-5 font-display text-5xl font-light leading-[0.95] sm:text-6xl lg:text-7xl" />
            <div className="relative mt-12 aspect-[4/3] overflow-hidden">
              <motion.img style={{ y, scale: 1.18 }} src="/images/atelier.jpg" alt="The perfumer's atelier" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center lg:col-span-5 lg:col-start-8">
          {STEPS.map((s, i) => (
            <FadeUp key={s.n} delay={i * 0.08} className="border-t border-white/15 py-12 first:border-t-0 lg:py-20">
              <span className="font-display text-6xl italic text-[#D9B56A]">{s.n}</span>
              <h3 className="mt-6 font-display text-3xl sm:text-4xl">{s.t}</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#C9BFAE]">{s.d}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
