import { ShieldCheck, Droplets, FlaskConical, Leaf, Gem } from "lucide-react";
import { FadeUp } from "@/components/site/Reveal";

const ITEMS = [
  {
    numeral: "I",
    Icon: Droplets,
    t: "High-grade naturals",
    d: "Absolutes, precious resins, and woods sourced directly from Grasse, Mysore, and Kannauj.",
  },
  {
    numeral: "II",
    Icon: ShieldCheck,
    t: "IFRA certified",
    d: "Every formula complies strictly with global IFRA standards for safe, non-irritating skin wear.",
  },
  {
    numeral: "III",
    Icon: FlaskConical,
    t: "Eau de Parfum strength",
    d: "Formulated up to 30% pure fragrance oil. A single morning application delivers all-day presence.",
  },
  {
    numeral: "IV",
    Icon: Leaf,
    t: "Cruelty-free & vegan",
    d: "Ethically composed without animal-derived musks or animal testing. Consciously crafted.",
  },
  {
    numeral: "V",
    Icon: Gem,
    t: "Small-batch craft",
    d: "Macerated for weeks in small vessels and inspected by hand before earning the house seal.",
  },
];

export function Credentials() {
  return (
    <section
      className="relative border-y border-border/40 bg-card/30 text-foreground backdrop-blur-sm"
      data-testid="credentials-section"
      aria-label="House standards and credentials"
    >
      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-10 lg:py-24">
        {/* Editorial Section Header */}
        <div className="mb-16 flex flex-col justify-between gap-6 border-b border-border/40 pb-10 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">House Standards</p>
            <h2 className="mt-4 font-display text-4xl leading-[1] tracking-tight sm:text-5xl lg:text-6xl">
              Crafted with <span className="font-display-italic text-gold">uncompromising standards.</span>
            </h2>
          </div>
          <p className="max-w-md text-base font-light leading-relaxed text-muted-foreground sm:text-lg lg:pb-2">
            Our atelier honors traditional European maceration alongside certified safety standards.
          </p>
        </div>

        {/* Minimalist Editorial Columns */}
        <div className="grid grid-cols-1 divide-y divide-border/30 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 sm:divide-y-0 lg:grid-cols-5 lg:divide-x lg:divide-border/30 lg:gap-0">
          {ITEMS.map(({ numeral, Icon, t, d }, i) => (
            <FadeUp
              key={t}
              delay={i * 0.08}
              className="group flex flex-col justify-between py-8 first:pt-0 last:pb-0 sm:py-0 lg:px-7 first:lg:pl-0 last:lg:pr-0"
              data-testid={`credential-${i}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs uppercase tracking-[0.28em] text-gold/80">
                    {numeral}
                  </span>
                  <Icon
                    className="h-5 w-5 text-gold/60 transition-transform duration-500 group-hover:scale-110 group-hover:text-gold"
                    strokeWidth={1.3}
                  />
                </div>
                <h3 className="mt-5 font-display text-xl leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-gold sm:text-2xl">
                  {t}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                  {d}
                </p>
              </div>
              <div className="mt-6 h-[1px] w-0 bg-gold/50 transition-all duration-500 group-hover:w-12" />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
