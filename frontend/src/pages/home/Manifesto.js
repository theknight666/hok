import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { MaskLines } from "@/components/site/Reveal";

export function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["8%", "-12%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-14%", "6%"]);

  return (
    <section ref={ref} className="relative overflow-hidden border-t py-28 lg:py-40" data-testid="manifesto-section">
      <motion.p style={{ x: x1 }} className="whitespace-nowrap font-display text-[16vw] font-light leading-[0.9] tracking-tight" aria-hidden="true">
        Honour · Valour
      </motion.p>
      <motion.p style={{ x: x2 }} className="whitespace-nowrap font-display text-[16vw] font-light italic leading-[0.9] tracking-tight text-gold" aria-hidden="true">
        Presence · Legacy
      </motion.p>
      <div className="mx-auto mt-20 max-w-[1500px] px-5 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <MaskLines as="h2" inView lines={["Every knight", "carries a signature."]} className="font-display text-4xl font-light leading-tight sm:text-5xl lg:col-span-6" />
          <div className="flex flex-col items-start gap-8 lg:col-span-4 lg:col-start-9">
            <p className="text-base leading-relaxed text-muted-foreground">
              Not a scent to blend in — a crest to be recognised by. Find yours among the four.
            </p>
            <Link to="/#collection" className="btn-ghost-royal" data-testid="manifesto-cta">Find your signature</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
