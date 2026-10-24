import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, EyeOff, Trash2, Star } from "lucide-react";
import { api, formatErr } from "@/lib/api";

const FILTERS = [["pending", "Awaiting approval"], ["approved", "Live"], ["hidden", "Hidden"], ["", "All"]];

export const Stars = ({ n, className = "h-4 w-4" }) => (
  <span className="inline-flex gap-0.5" aria-label={`${n} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`${className} ${i <= n ? "fill-current text-gold" : "text-border"}`} strokeWidth={2} />)}
  </span>
);

export function Reviews() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("pending");
  const { data } = useQuery({ queryKey: ["admin-reviews", status], queryFn: async () => (await api.get(`/admin/reviews${status ? `?status=${status}` : ""}`)).data });
  const reviews = Array.isArray(data) ? data : [];
  const refresh = () => ["admin-reviews", "reviews", "featured-reviews"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

  const setState = async (r, next) => {
    try {
      await api.patch(`/admin/reviews/${r.id}`, { status: next });
      toast.success(next === "approved" ? "Review is live" : "Review hidden");
      refresh();
    } catch (e) {
      toast.error(formatErr(e));
    }
  };
  const remove = async (r) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      await api.delete(`/admin/reviews/${r.id}`);
      toast.success("Review deleted");
      refresh();
    } catch (e) {
      toast.error(formatErr(e));
    }
  };

  return (
    <div data-testid="admin-reviews">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="font-display text-2xl">Client Reviews</p>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(([v, l]) => (
            <button key={v} onClick={() => setStatus(v)} data-testid={`reviews-filter-${v || "all"}`} className={`pill border-2 transition-colors ${status === v ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>{l}</button>
          ))}
        </div>
      </div>
      <ul className="divide-y border-y" data-testid="admin-reviews-list">
        {reviews.map((r) => (
          <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 py-5" data-testid={`admin-review-${r.id}`}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Stars n={r.rating} />
                <span className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-muted-foreground">{r.product_name}</span>
                <span className={`pill !px-2.5 !py-1 ${r.status === "approved" ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400" : r.status === "hidden" ? "bg-muted text-muted-foreground" : "bg-gold/15 text-gold"}`}>{r.status}</span>
              </div>
              <p className="mt-2 font-display text-xl leading-tight">“{r.text}”</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.user_name} · {new Date(r.created_at).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="flex gap-2">
              {r.status !== "approved" && (
                <button onClick={() => setState(r, "approved")} className="btn-royal !px-4 !py-2.5 !text-xs" data-testid={`review-approve-${r.id}`}><Check className="h-4 w-4" /> Approve</button>
              )}
              {r.status !== "hidden" && (
                <button onClick={() => setState(r, "hidden")} className="btn-ghost-royal !px-4 !py-2.5 !text-xs" data-testid={`review-hide-${r.id}`}><span className="inline-flex items-center gap-2"><EyeOff className="h-4 w-4" /> Hide</span></button>
              )}
              <button onClick={() => remove(r)} className="grid h-10 w-10 place-items-center rounded-full border-2 border-border text-destructive transition-colors hover:border-destructive" aria-label="Delete review" data-testid={`review-delete-${r.id}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
        {!reviews.length && <li className="py-6 text-sm text-muted-foreground" data-testid="admin-reviews-empty">Nothing here yet.</li>}
      </ul>
    </div>
  );
}
