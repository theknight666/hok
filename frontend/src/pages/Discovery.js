import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Check,
  ShieldCheck,
  Droplets,
  ArrowRight,
  Flame,
  Clock,
  Compass,
  Smile
} from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/api";
import { Bottle } from "@/components/site/Bottle";
import { KnightMark } from "@/components/site/Logo";
import { SplitChars, FadeUp, EASE } from "@/components/site/Reveal";

const ADVANTAGES = [
  {
    icon: Droplets,
    title: "Test On Your Skin",
    desc: "Fragrance develops differently on everyone. A 2ml sample lets you test the opening, heart, and drydown over a full day of wear."
  },
  {
    icon: Clock,
    title: "30+ Sprays Per Vial",
    desc: "Each 2ml spray vial gives you around 30 to 35 sprays, giving you 4 to 5 wears to decide if it's the right signature for you."
  },
  {
    icon: ShieldCheck,
    title: "Pocket-Friendly & Travel-Ready",
    desc: "Compact spray vials that easily slip into your pocket, gym bag, or car console for easy reapplication on the go."
  }
];

export default function DiscoveryPage() {
  const { products, isLoading } = useProducts();
  const { add } = useCart();
  const [addingAll, setAddingAll] = useState(false);

  // Discovery Coffret: 4 items at sample_price
  const signatures = products.slice(0, 4);
  const coffretPrice = signatures.reduce((sum, p) => sum + (p.sample_price || 99), 0) || 396;

  const handleAddCoffret = () => {
    if (!signatures.length) return;
    setAddingAll(true);
    signatures.forEach((p) => {
      add(p, 1, "2 ml");
    });
    toast.success("Complete 4-Piece Discovery Set added to your bag", {
      description: "Includes 4x 2ml discovery spray vials."
    });
    setTimeout(() => setAddingAll(false), 600);
  };

  const handleAddSample = (p) => {
    add(p, 1, "2 ml");
    toast.success(`${p.name} (2ml Discovery Vial) added to bag`);
  };

  return (
    <main className="min-h-[100svh] bg-background pt-28 pb-32 text-foreground selection:bg-gold selection:text-ink sm:pt-36" data-testid="discovery-page">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        {/* ======================================================== */}
        {/* HERO TITLE & POSITIONING                                 */}
        {/* ======================================================== */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5">
            <KnightMark className="h-4 w-4 -translate-y-[1px]" />
            <span className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-gold">
              Discovery Samples · 2ml Spray Vials
            </span>
          </div>

          <h1 className="hero-title mt-4 font-display tracking-tight text-foreground">
            <span className="block">Sample before you commit.</span>
            <span className="font-display-italic text-gold">Four Signature Extraits.</span>
          </h1>

          <p className="mt-4 text-base font-normal leading-relaxed text-muted-foreground sm:text-lg">
            Try our fragrances in handy 2ml spray vials before ordering a full 50ml bottle.
            Each vial contains 30+ sprays of our extrait formulation, allowing you to test performance and longevity on your skin.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs text-muted-foreground">
            <span>₹99 per 2ml vial · Available individually or as a 4-piece set</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* COMPLETE DISCOVERY COFFRET HERO CARD                    */}
        {/* ======================================================== */}
        <FadeUp className="mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-card/90 via-card/50 to-gold/5 p-6 backdrop-blur-xl sm:p-10 lg:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-gold px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.25em] text-[#0C0B0E]">
                    Best Value
                  </span>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Complete 4 × 2ml Discovery Set
                  </span>
                </div>

                <h2 className="mt-4 font-display text-3xl sm:text-4xl text-foreground">
                  The Complete Discovery Set
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base max-w-xl">
                  Get all 4 of our signature fragrances in 2ml spray vials: Blonde Amber, Layton, Angels Share On The Rocks, and Side Effect. Perfect for finding your everyday favorite or layering different scent profiles.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {signatures.map((p) => (
                    <div key={p.slug} className="rounded-2xl border border-border/70 bg-background/50 p-3 text-left">
                      <span className="text-[10px] font-mono text-gold uppercase tracking-wider block">2ml Vial</span>
                      <p className="font-display text-sm font-medium mt-1 truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.tagline || "Extrait de Parfum"}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground block">Set Price</span>
                    <span className="font-display text-4xl text-foreground font-semibold">{inr(coffretPrice)}</span>
                  </div>

                  <button
                    onClick={handleAddCoffret}
                    disabled={addingAll || isLoading || !signatures.length}
                    className="btn-royal inline-flex items-center gap-3 px-8 py-3.5 shadow-lg shadow-gold/20"
                    data-testid="add-coffret-btn"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{addingAll ? "Adding All 4 Vials..." : `Add Complete Set · ${inr(coffretPrice)}`}</span>
                  </button>
                </div>
              </div>

              {/* Coffret Visual Side */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative w-full max-w-md rounded-2xl border border-border/60 bg-gradient-to-b from-card/80 to-background/90 p-6 text-center">
                  <div className="grid grid-cols-4 gap-2 py-4">
                    {signatures.map((p, idx) => (
                      <motion.div
                        key={p.slug}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="flex flex-col items-center"
                      >
                        <div className="h-28 w-12 rounded-xl bg-gold/10 border border-gold/30 flex flex-col items-center justify-between p-1.5 shadow-inner">
                          <span className="w-5 h-2 rounded-t-sm bg-gold/40 border border-gold/60" />
                          <div className="w-full flex-1 my-1 rounded-sm bg-gradient-to-t from-gold/30 to-gold/10 flex items-center justify-center">
                            <span className="text-[9px] font-mono text-gold font-bold">2ml</span>
                          </div>
                          <span className="text-[7px] tracking-tighter text-muted-foreground uppercase truncate max-w-full">
                            {p.name.split(" ")[0]}
                          </span>
                        </div>
                        <span className="mt-2 text-[10px] font-medium text-foreground truncate max-w-full">
                          {p.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-border/50 pt-4 flex items-center justify-between text-xs text-muted-foreground px-2">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-gold" /> Long Lasting
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gold" /> 30+ Sprays Each
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ======================================================== */}
        {/* INDIVIDUAL DISCOVERY VIALS GRID                         */}
        {/* ======================================================== */}
        <div className="mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="eyebrow">Individual Samples</p>
              <h2 className="display-sm mt-2 font-display text-foreground">
                Pick Individual 2ml Vials
              </h2>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              ₹99 Each · Free Shipping Over ₹15,000
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {signatures.map((p) => {
              const samplePrice = p.sample_price || 99;
              return (
                <div
                  key={p.slug}
                  data-testid={`discovery-card-${p.slug}`}
                  className="group relative flex flex-col justify-between rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold/50 hover:bg-card/70 hover:shadow-xl hover:shadow-gold/5"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">
                        2ml Spray
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        30+ Sprays
                      </span>
                    </div>

                    {/* Bottle Visual Preview */}
                    <div className="my-8 flex h-44 items-center justify-center">
                      <Bottle
                        slug={p.slug}
                        name={p.name}
                        color={p.color}
                        image={p.image}
                        className="h-36 w-24 object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Info */}
                    <p className="eyebrow text-xs">{p.badge || "Signature Scent"}</p>
                    <h3 className="font-display text-2xl font-medium mt-1 text-foreground">
                      <Link to={`/fragrance/${p.slug}`} className="hover:text-gold transition-colors">
                        {p.name}
                      </Link>
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {p.tagline}
                    </p>

                    {/* Notes preview */}
                    {p.notes && (
                      <div className="mt-4 border-t border-border/40 pt-3 flex flex-wrap gap-1.5">
                        {[...(p.notes.top || []).slice(0, 1), ...(p.notes.heart || []).slice(0, 1), ...(p.notes.base || []).slice(0, 1)].map((n, i) => (
                          <span key={i} className="text-[10px] bg-background/60 border border-border/50 rounded-md px-2 py-0.5 text-muted-foreground">
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">2ml Sample</span>
                      <span className="font-display text-xl font-bold text-foreground">{inr(samplePrice)}</span>
                    </div>

                    <button
                      onClick={() => handleAddSample(p)}
                      data-testid={`add-sample-${p.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-gold transition-all duration-300 hover:bg-gold hover:text-ink hover:shadow-md"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Add 2ml</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* WHY SAMPLE FIRST                                         */}
        {/* ======================================================== */}
        <div className="mt-20 rounded-3xl border border-border/60 bg-card/30 p-8 sm:p-12">
          <p className="eyebrow text-center">Sampling Guide</p>
          <h2 className="display-sm mt-2 text-center font-display text-foreground">
            Why Try a Sample First?
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {ADVANTAGES.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex flex-col items-start rounded-2xl border border-border/40 bg-background/40 p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl text-foreground">{a.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{a.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 pt-8">
            <div className="flex items-center gap-3">
              <Compass className="h-5 w-5 text-gold" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Need help deciding which scent suits you best? Feel free to contact us.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold hover:underline"
            >
              <span>Contact Us</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
