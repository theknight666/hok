import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ThermometerSnowflake,
  Sparkles,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";
import { api, inr, formatErr } from "@/lib/api";
import { FadeUp, EASE } from "@/components/site/Reveal";
import { KnightMark } from "@/components/site/Logo";

const STEPS = [
  { id: "confirmed", label: "Formulation & Quality Seal", desc: "Batch verified, serialized crystal flacon filled." },
  { id: "processing", label: "Crest & Presentation Packaging", desc: "Secured in cushioned velvet case with wax seal." },
  { id: "dispatched", label: "Temperature-Controlled Transit", desc: "En route via express air courier in heat-isolated packaging." },
  { id: "delivered", label: "Delivered to Recipient", desc: "Handed over with signature verification." },
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order_id") || searchParams.get("id") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchOrder = async (idToSearch, emailToSearch) => {
    const cleanId = (idToSearch || orderId).trim().toUpperCase();
    if (!cleanId) {
      setError("Please enter your Order ID (e.g. HOTK-XXXXXX)");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const params = {};
      const cleanEmail = (emailToSearch !== undefined ? emailToSearch : email).trim();
      if (cleanEmail) params.email = cleanEmail;

      const res = await api.get(`/orders/track/${encodeURIComponent(cleanId)}`, { params });
      setOrder(res.data);
    } catch (err) {
      // If error, check if user requested a demo/sample fallback
      if (cleanId.includes("DEMO") || cleanId.includes("ROYAL") || cleanId.includes("SAMPLE")) {
        setOrder({
          order_id: cleanId,
          status: "dispatched",
          payment_status: "paid",
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          tracking_number: "BD-982410982",
          courier: "BlueDart Air Express",
          estimated_delivery: "Within 48 Hours",
          items: [
            { slug: "blonde-amber", name: "Blonde Amber", size: "50 ml", price: 18500, qty: 1, image: "/images/blonde-amber.jpg" },
            { slug: "layton", name: "Layton", size: "50 ml", price: 16500, qty: 1, image: "/images/layton.jpg" }
          ],
          subtotal: 35000,
          shipping: 0,
          total: 35000,
          address: {
            name: "Lord Sterling",
            street: "74 Altamount Road, Cumballa Hill",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400026",
            phone: "+91 98200 48291"
          }
        });
      } else {
        setError(formatErr(err) || "No dispatch record found. Verify your order ID or billing email.");
        setOrder(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialId = searchParams.get("order_id") || searchParams.get("id");
    if (initialId) {
      fetchOrder(initialId, searchParams.get("email") || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadDemo = () => {
    setOrderId("HOTK-ROYAL");
    setEmail("sterling@houseoftheknight.com");
    fetchOrder("HOTK-ROYAL", "sterling@houseoftheknight.com");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine active step index (0 to 3)
  const getStepIndex = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return 3;
    if (s === "dispatched" || s === "in_transit") return 2;
    if (s === "processing" || s === "packed") return 1;
    return 0; // pending / confirmed
  };

  const activeStep = order ? getStepIndex(order.status) : 0;

  return (
    <main className="min-h-[100svh] bg-background pt-28 pb-24 text-foreground selection:bg-gold selection:text-ink sm:pt-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10">
        {/* ======================================================== */}
        {/* HERO TITLE & INTRO                                       */}
        {/* ======================================================== */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <KnightMark className="h-6 w-6 text-gold" />
            <span className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-gold">
              House Concierge · Courier & Dispatch
            </span>
          </div>

          <h1 className="hero-title mt-4 font-display tracking-tight text-foreground">
            Track your <span className="font-display-italic text-gold">House dispatch.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            Every flacon is hand-inspected, sealed with the House crest, and dispatched via temperature-monitored air transit. Enter your order credentials below to inspect real-time progress.
          </p>
        </div>

        {/* ======================================================== */}
        {/* SEARCH TERMINAL                                          */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-12 rounded-[2rem] border border-border/60 bg-card/40 p-6 shadow-xl backdrop-blur-md sm:p-10"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrder();
            }}
            className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-end"
          >
            <div className="md:col-span-5">
              <label className="block text-[0.66rem] font-medium uppercase tracking-[0.26em] text-gold">
                Order ID <span className="text-foreground/50">*</span>
              </label>
              <div className="relative mt-2">
                <Package className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  placeholder="HOTK-B8291F"
                  className="w-full rounded-full border border-border/60 bg-background/80 py-4 pl-12 pr-4 text-sm font-medium tracking-wider text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-[0.66rem] font-medium uppercase tracking-[0.26em] text-gold">
                Billing Email <span className="text-foreground/40 font-light text-[0.6rem]">(Optional)</span>
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-full border border-border/60 bg-background/80 py-4 pl-12 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-royal w-full !py-4 shadow-lg hover:shadow-gold/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Locating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Locate Dispatch <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Assist */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-5 text-xs text-muted-foreground">
            <span className="text-[0.68rem] tracking-wide">
              Format: <span className="font-mono text-foreground">HOTK-</span> followed by 6 alphanumeric characters.
            </span>
            <button
              type="button"
              onClick={loadDemo}
              className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold transition-colors hover:text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Inspect Live Demo Order (HOTK-ROYAL)
            </button>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* ERROR NOTIFICATION                                       */}
        {/* ======================================================== */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 flex items-center gap-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-foreground"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="flex-1">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* ACTIVE ORDER DISPATCH CONSOLE                            */}
        {/* ======================================================== */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mt-14 space-y-10"
            >
              {/* Order Status Banner */}
              <div className="relative overflow-hidden rounded-[2.5rem] border border-gold/30 bg-gradient-to-br from-card via-card/70 to-background p-8 shadow-2xl sm:p-12">
                <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />

                <div className="relative z-10 flex flex-col justify-between gap-6 border-b border-border/40 pb-8 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {order.order_id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(order.order_id)}
                        className="rounded-full border border-border/60 bg-background/60 p-2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Copy order id"
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <span className="pill bg-gold/15 text-gold border border-gold/30 !px-3 !py-1 capitalize font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse mr-1" />
                        {order.status || "In Transit"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-light text-muted-foreground">
                      Commissioned on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
                    </p>
                  </div>

                  {/* Courier & ETA block */}
                  <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-border/50 bg-background/50 p-4 sm:gap-8">
                    <div>
                      <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                        Courier Partner
                      </p>
                      <p className="mt-1 font-display text-sm font-semibold text-foreground">
                        {order.courier || "BlueDart Air Express"}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-border/50" />
                    <div>
                      <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                        Estimated Arrival
                      </p>
                      <p className="mt-1 font-display text-sm font-semibold text-gold">
                        {order.estimated_delivery || "2–3 Business Days"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4-Stage Visual Timeline */}
                <div className="relative mt-12">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {STEPS.map((step, idx) => {
                      const isComplete = idx <= activeStep;
                      const isCurrent = idx === activeStep;
                      return (
                        <div key={step.id} className="relative flex flex-col">
                          {/* Progress Line */}
                          {idx < STEPS.length - 1 && (
                            <div
                              className={`hidden md:block absolute left-4 top-4 h-[2px] w-[calc(100%-1rem)] -z-0 transition-colors duration-500 ${
                                idx < activeStep ? "bg-gold" : "bg-border/60"
                              }`}
                            />
                          )}

                          <div className="relative z-10 flex items-center gap-4 md:flex-col md:items-start md:gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                                isComplete
                                  ? "border-gold bg-gold text-[#0C0B0E]"
                                  : "border-border/80 bg-background text-muted-foreground"
                              } ${isCurrent ? "ring-4 ring-gold/25" : ""}`}
                            >
                              {isComplete ? (
                                <CheckCircle2 className="h-4 w-4" strokeWidth={2.6} />
                              ) : (
                                <span className="text-xs font-bold">{idx + 1}</span>
                              )}
                            </div>

                            <div>
                              <p className={`font-display text-sm sm:text-base ${isComplete ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                                {step.label}
                              </p>
                              <p className="mt-1 text-xs font-light leading-snug text-muted-foreground/80">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Items & Address Grid */}
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                {/* Items Ordered */}
                <div className="rounded-[2rem] border border-border/60 bg-card/40 p-6 sm:p-8 lg:col-span-7">
                  <h3 className="font-display text-xl text-foreground">Package Contents</h3>
                  <div className="mt-6 divide-y divide-border/40">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-background/50 p-1">
                            <img
                              src={item.image || "/images/blonde-amber.jpg"}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div>
                            <Link to={`/fragrance/${item.slug}`} className="font-display text-base text-foreground hover:text-gold transition-colors">
                              {item.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {item.size || "50 ml"} · Qty: {item.qty}
                            </p>
                          </div>
                        </div>
                        <p className="font-display text-base text-foreground">
                          {inr(item.price * item.qty)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Financial Summary */}
                  <div className="mt-8 border-t border-border/40 pt-6 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{inr(order.subtotal || order.total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Luxury Gift Packaging</span>
                      <span className="text-gold font-medium uppercase text-xs tracking-wider">Complimentary</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Express Air Transit</span>
                      <span className="text-gold font-medium uppercase text-xs tracking-wider">
                        {order.shipping ? inr(order.shipping) : "Complimentary"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-3 font-display text-lg text-foreground">
                      <span>Total Valuation</span>
                      <span className="text-gold">{inr(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address & Security Verification */}
                <div className="space-y-6 lg:col-span-5">
                  <div className="rounded-[2rem] border border-border/60 bg-card/40 p-6 sm:p-8">
                    <h3 className="font-display text-xl text-foreground">Delivery Destination</h3>
                    {order.address ? (
                      <div className="mt-4 text-sm leading-relaxed text-muted-foreground space-y-1">
                        <p className="font-display font-medium text-foreground text-base">{order.address.name}</p>
                        <p>{order.address.street}</p>
                        <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                        <p className="pt-2 text-xs font-mono text-foreground/70">Contact: {order.address.phone}</p>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground">Address on file with courier verification.</p>
                    )}
                  </div>

                  <div className="rounded-[2rem] border border-gold/30 bg-gold/5 p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-gold" />
                      <h4 className="font-display text-lg text-foreground">White-Glove Delivery</h4>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      This dispatch is protected by the House Fragile Crystal Guarantee. In the rare event of transit damage or leaks, contact our concierge for an immediate priority replacement.
                    </p>
                    <Link
                      to="/contact"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold hover:underline"
                    >
                      Contact Concierge <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* THREE HOUSE TRANSIT GUARANTEES                           */}
        {/* ======================================================== */}
        <div className="mt-24 border-t border-border/40 pt-16">
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-gold">
            House Transit Standards
          </p>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <FadeUp delay={0.1} className="rounded-2xl border border-border/40 bg-card/20 p-6">
              <ThermometerSnowflake className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <h4 className="mt-4 font-display text-lg text-foreground">Temperature Safeguard</h4>
              <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                Heat-isolated transit sleeves prevent thermal degradation during flight and last-mile transit, safeguarding the delicate top notes.
              </p>
            </FadeUp>

            <FadeUp delay={0.2} className="rounded-2xl border border-border/40 bg-card/20 p-6">
              <ShieldCheck className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <h4 className="mt-4 font-display text-lg text-foreground">Italian Crystal Insurance</h4>
              <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                100% full replacement policy. If any flacon arrives damaged or compromised, a priority flacon is dispatched immediately with zero friction.
              </p>
            </FadeUp>

            <FadeUp delay={0.3} className="rounded-2xl border border-border/40 bg-card/20 p-6">
              <Package className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <h4 className="mt-4 font-display text-lg text-foreground">Discreet Outer Box</h4>
              <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                Exterior packaging contains no luxury brand markers or price indications, ensuring absolute security and confidentiality during transit.
              </p>
            </FadeUp>
          </div>
        </div>
      </div>
    </main>
  );
}
