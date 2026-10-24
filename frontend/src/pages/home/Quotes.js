import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Stars } from "@/pages/admin/Reviews";

function Card({ r }) {
  return (
    <figure className="w-[82vw] max-w-[420px] shrink-0 rounded-[2rem] bg-background p-7 text-foreground shadow-lg sm:p-9 will-change-transform transform-gpu" data-testid={`quote-${r.id}`}>
      <Stars n={r.rating} />
      <blockquote className="mt-4 font-display text-2xl leading-tight sm:text-3xl">“{r.text}”</blockquote>
      <figcaption className="mt-6 flex flex-wrap items-center justify-between gap-2 text-[0.66rem] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        <span>{r.user_name} · Verified buyer</span>
        <Link to={`/fragrance/${r.product_slug}`} className="text-gold link-line">{r.product_name}</Link>
      </figcaption>
    </figure>
  );
}

export function Quotes() {
  const { data } = useQuery({ queryKey: ["featured-reviews"], queryFn: async () => (await api.get("/reviews/featured?limit=12")).data });
  const reviews = Array.isArray(data) ? data : [];
  const loop = reviews.length < 4 ? reviews : [...reviews, ...reviews];

  return (
    <section className="overflow-hidden bg-[#F2A900] py-20 text-[#1C1105] lg:py-28" data-testid="quotes-section" aria-label="What people say">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] opacity-70">Words from the court · verified buyers only</p>
        <h2 className="display-lg mt-3 font-display">Words from <span className="font-display-italic text-gold">the court</span></h2>
      </div>
      {reviews.length ? (
        <div className={`mt-12 flex gap-5 px-5 sm:px-10 ${reviews.length < 4 ? "flex-wrap" : "w-max animate-marquee-slow will-change-transform transform-gpu"}`}>
          {loop.map((r, i) => <Card key={`${r.id}-${i}`} r={r} />)}
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-[1600px] px-5 sm:px-10" data-testid="quotes-empty">
          <p className="max-w-xl font-display text-3xl leading-tight sm:text-4xl">The court is quiet. Own a bottle, leave the first word.</p>
          <Link to="/#collection" className="btn-world mt-8" style={{ "--w-ink": "#1C1105", "--w-bg": "#F2A900" }} data-testid="quotes-empty-cta">Choose your weapon</Link>
        </div>
      )}
    </section>
  );
}
