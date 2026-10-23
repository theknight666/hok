const QUOTES = [
  { q: "Wore Side Effect to a dinner. Three people asked, one followed me to the car.", h: "@rhea.vora" },
  { q: "Blonde Amber is the first perfume I've finished a bottle of. Finished. A whole bottle.", h: "@aarav.m" },
  { q: "Layton smells like a tailored suit that knows it fits.", h: "@thescentedlife" },
  { q: "Angels Share On The Rocks got me upgraded on a flight. Correlation, causation, whatever.", h: "@kabir.sh" },
  { q: "My husband stole my Side Effect. Ordering two now.", h: "@ninaaa.k" },
  { q: "Sprayed once at 8am. Still turning heads at midnight. Witchcraft.", h: "@prisha_notes" },
];

function Card({ q, h }) {
  return (
    <figure className="w-[82vw] max-w-[420px] shrink-0 rounded-[2rem] bg-background p-7 text-foreground shadow-lg sm:p-9">
      <blockquote className="font-display text-2xl leading-tight sm:text-3xl">“{q}”</blockquote>
      <figcaption className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{h}</figcaption>
    </figure>
  );
}

export function Quotes() {
  return (
    <section className="overflow-hidden bg-[#F2A900] py-20 text-[#1C1105] lg:py-28" data-testid="quotes-section" aria-label="What people say">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-70">Words from the court</p>
        <h2 className="display-lg mt-3 font-display">R e v i e w s</h2>
      </div>
      <div className="mt-12 flex w-max animate-marquee-slow gap-5 px-5">
        {[...QUOTES, ...QUOTES].map((x, i) => (
          <Card key={i} {...x} />
        ))}
      </div>
    </section>
  );
}
