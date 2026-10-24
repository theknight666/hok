import { ShieldCheck, Droplets, FlaskConical, Leaf, Gem } from "lucide-react";
import { FadeUp } from "@/components/site/Reveal";

const ITEMS = [
  { Icon: Droplets, t: "High-grade oils & naturals", d: "Absolutes, resins and woods sourced from Grasse, Mysore and Kannauj." },
  { Icon: ShieldCheck, t: "IFRA certified", d: "Every formula complies with IFRA safety standards for skin wear." },
  { Icon: FlaskConical, t: "Extrait strength", d: "Up to 30% concentration. One wear, a full day of presence." },
  { Icon: Leaf, t: "Cruelty-free & vegan", d: "No animal testing, no animal-derived musks. Ever." },
  { Icon: Gem, t: "Small batch, hand-finished", d: "Macerated for weeks, nosed by hand, crested before it leaves the House." },
];

export function Credentials() {
  return (
    <section className="relative bg-foreground text-background" data-testid="credentials-section" aria-label="Our standards">
      <div className="mx-auto max-w-[1600px] px-5 py-14 sm:px-10 lg:py-20">
        <div className="grid gap-px overflow-hidden rounded-[2rem] border border-background/15 bg-background/15 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map(({ Icon, t, d }, i) => (
            <FadeUp key={t} delay={i * 0.08} className="group bg-foreground p-7 transition-colors duration-500 hover:bg-background hover:text-foreground lg:p-8" data-testid={`credential-${i}`}>
              <Icon className="h-6 w-6 text-gold transition-transform duration-500 group-hover:-translate-y-1" strokeWidth={1.4} />
              <p className="mt-6 font-display text-base leading-snug sm:text-lg">{t}</p>
              <p className="mt-3 text-sm font-light leading-relaxed opacity-70">{d}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
