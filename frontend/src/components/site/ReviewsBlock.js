import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { api, formatErr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Stars } from "@/pages/admin/Reviews";
import { FadeUp } from "@/components/site/Reveal";

function ReviewForm({ slug, existing, onSaved }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState(existing?.text || "");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Pick a star rating first");
    setBusy(true);
    try {
      await api.post(`/products/${slug}/reviews`, { rating, text });
      toast.success("Thank you. Your words go live once the House approves them.");
      onSaved();
    } catch (err) {
      toast.error(formatErr(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[1.5rem] border-2 p-6" data-testid="review-form">
      <p className="font-display text-2xl">{existing ? "Update your verdict" : "Leave your verdict"}</p>
      {existing?.status === "pending" && <p className="mt-1 text-sm text-gold" data-testid="review-pending-note">Your review is awaiting approval.</p>}
      <div className="mt-4 flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} aria-label={`${i} star${i > 1 ? "s" : ""}`} data-testid={`review-star-${i}`} className="transition-transform hover:scale-110">
            <Star className={`h-8 w-8 ${i <= (hover || rating) ? "fill-current text-gold" : "text-border"}`} strokeWidth={2} />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 180))}
        rows={3}
        required
        minLength={3}
        placeholder="One line. Make it count."
        data-testid="review-text"
        className="mt-4 w-full resize-none rounded-2xl border-2 bg-transparent p-4 text-base font-medium outline-none focus:border-gold"
      />
      <div className="mt-3 flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-muted-foreground">{text.length}/180</span>
        <button disabled={busy} className="btn-royal !px-6 !py-3 disabled:opacity-60" data-testid="review-submit">{busy ? "Sending…" : existing ? "Update review" : "Submit review"}</button>
      </div>
    </form>
  );
}

export function ReviewsBlock({ slug, name }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["reviews", slug], queryFn: async () => (await api.get(`/products/${slug}/reviews`)).data });
  const { data: elig } = useQuery({
    queryKey: ["review-eligibility", slug, user?.user_id],
    queryFn: async () => (await api.get(`/products/${slug}/reviews/eligibility`)).data,
    enabled: !!user,
  });
  const items = data?.items || [];
  const onSaved = () => ["reviews", "review-eligibility", "featured-reviews"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

  return (
    <FadeUp className="mt-16" data-testid="reviews-block">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Words from the court</p>
          <p className="mt-3 font-display text-3xl">{data?.count ? `${data.average} / 5` : "No verdicts yet"}</p>
        </div>
        {data?.count ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground" data-testid="reviews-summary">
            <Stars n={Math.round(data.average)} /> {data.count} review{data.count > 1 ? "s" : ""}
          </div>
        ) : null}
      </div>

      <ul className="mt-6 space-y-4" data-testid="reviews-list">
        {items.map((r) => (
          <li key={r.id} className="rounded-[1.5rem] bg-muted/60 p-5" data-testid={`review-${r.id}`}>
            <Stars n={r.rating} />
            <p className="mt-2 font-display text-xl leading-tight">“{r.text}”</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{r.user_name} · Verified buyer</p>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {!user && (
          <p className="text-sm text-muted-foreground" data-testid="review-login-hint">
            Bought {name}? <Link to="/login" className="font-bold text-gold">Sign in</Link> to leave your verdict.
          </p>
        )}
        {user && elig && !elig.can_review && (
          <p className="text-sm text-muted-foreground" data-testid="review-purchase-hint">Reviews are reserved for customers who own {name}. Once it has been in your bag, your verdict is welcome here.</p>
        )}
        {user && elig?.can_review && <ReviewForm slug={slug} existing={elig.existing} onSaved={onSaved} />}
      </div>
    </FadeUp>
  );
}
