import { KnightMark } from "./Logo";

const WORDS = ["Blonde Amber", "Layton", "Angels Share On The Rocks", "Side Effect", "Armour for the senses"];

export function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <section className="relative overflow-hidden border-y py-8 sm:py-10" data-testid="editorial-marquee" aria-label="House signatures">
      <div className="flex w-max animate-marquee items-center">
        {[0, 1].map((k) => (
          <div key={k} className="flex items-center" aria-hidden={k === 1}>
            {row.map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center">
                <span className={`px-8 font-display text-4xl sm:text-6xl ${i % 2 ? "italic text-gold" : ""}`}>{w}</span>
                <KnightMark className="h-6 w-6 text-gold opacity-70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
