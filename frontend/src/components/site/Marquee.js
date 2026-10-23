import { KnightMark } from "./Logo";

const WORDS = ["Blonde Amber", "Layton", "Angels Share On The Rocks", "Side Effect", "Smell like you own the castle"];

export function Marquee({ className = "" }) {
  const row = [...WORDS, ...WORDS];
  return (
    <section className={`relative overflow-hidden bg-foreground py-6 text-background sm:py-8 ${className}`} data-testid="editorial-marquee" aria-label="House signatures">
      <div className="flex w-max animate-marquee items-center">
        {[0, 1].map((k) => (
          <div key={k} className="flex items-center" aria-hidden={k === 1}>
            {row.map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-8 px-8">
                <span className={`whitespace-nowrap font-display text-5xl sm:text-7xl ${i % 2 ? "text-outline" : ""}`}>{w}</span>
                <KnightMark className="h-8 w-8 animate-spin-slow text-gold" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
