import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CubeGrid } from "@/components/site/CubeGrid";
import { SplitChars, FadeUp } from "@/components/site/Reveal";
import { featuredFirst } from "@/lib/visual";

const DEFAULT_SIGNATURE_SLUGS = ["blonde-amber", "layton", "angels-share-on-the-rocks", "side-effect"];

export function CollectionPreview({ products }) {
  // Only display fragrances selected in admin for the signature section, capped strictly at 4
  const signatureProducts = (products || []).filter((p) => {
    if (typeof p.show_in_signature === "boolean") return p.show_in_signature;
    return DEFAULT_SIGNATURE_SLUGS.includes(p.slug);
  });
  const list = (signatureProducts.length ? signatureProducts : featuredFirst(products)).slice(0, 4);
  return (
    <section id="collection" className="mx-auto max-w-[1600px] px-5 py-28 sm:px-10 lg:py-40" data-testid="collection-preview">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">The Collection</p>
          <SplitChars text="Choose your" className="display-lg mt-4 font-display" />
          <SplitChars text="signature." className="display-lg font-display-italic text-gold" delay={0.3} />
        </div>
        <FadeUp className="max-w-md">
          <p className="text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            An ever-growing library of eau de parfums, each with its own colour, character and raw materials. Built to be noticed from across the hall.
          </p>
          <Link to="/collection" className="btn-royal mt-6" data-testid="view-all-fragrances">
            All fragrances <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </FadeUp>
      </div>
      <CubeGrid products={list} className="mt-16" />
    </section>
  );
}
