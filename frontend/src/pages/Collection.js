import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { CubeGrid } from "@/components/site/CubeGrid";
import { SplitChars, FadeUp } from "@/components/site/Reveal";
import { featuredFirst } from "@/lib/visual";

const SORTS = [["featured", "Featured"], ["price-asc", "Price · low to high"], ["price-desc", "Price · high to low"], ["name", "A – Z"]];

export default function CollectionPage() {
  const { products, isLoading } = useProducts();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = products.filter((p) => {
      if (!needle) return true;
      const hay = [p.name, p.tagline, p.badge, ...(p.notes?.top || []), ...(p.notes?.heart || []), ...(p.notes?.base || [])].join(" ").toLowerCase();
      return hay.includes(needle);
    });
    if (sort === "price-asc") out = [...out].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") out = [...out].sort((a, b) => b.price - a.price);
    else if (sort === "name") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    else out = featuredFirst(out);
    return out;
  }, [products, q, sort]);

  return (
    <main className="mx-auto max-w-[1600px] px-5 pb-32 pt-32 sm:px-10 lg:pt-40" data-testid="collection-page">
      <p className="eyebrow">The Collection</p>
      <SplitChars text="Every fragrance" className="display-lg mt-4 font-display" />
      <SplitChars text="of the House." className="display-lg font-display-italic text-gold" delay={0.25} />
      <FadeUp className="mt-10 flex flex-col gap-4 border-y py-5 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex items-center gap-3 rounded-full border px-5 py-3 lg:w-96">
          <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or note — vanilla, oud, bergamot…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            data-testid="collection-search"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {SORTS.map(([v, l]) => (
            <button key={v} onClick={() => setSort(v)} data-testid={`collection-sort-${v}`} className={`pill border transition-colors ${sort === v ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>{l}</button>
          ))}
          <span className="ml-2 text-xs text-muted-foreground" data-testid="collection-count">{list.length} fragrance{list.length === 1 ? "" : "s"}</span>
        </div>
      </FadeUp>
      <div className="mt-12">
        {isLoading ? <div className="h-64" /> : list.length ? <CubeGrid products={list} /> : (
          <p className="py-20 text-center font-display text-2xl" data-testid="collection-empty">Nothing in the House matches that — yet.</p>
        )}
      </div>
    </main>
  );
}
