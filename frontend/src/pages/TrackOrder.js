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
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Box
} from "lucide-react";
import { api, inr, formatErr } from "@/lib/api";
import { FadeUp, EASE } from "@/components/site/Reveal";
import { KnightMark } from "@/components/site/Logo";

const STEPS = [
  { id: "confirmed", label: "Order Confirmed", desc: "Your order has been received and verified." },
  { id: "processing", label: "Packed & Prepared", desc: "Carefully wrapped and boxed for safe transit." },
  { id: "dispatched", label: "Dispatched", desc: "Handed over to courier with live tracking." },
  { id: "delivered", label: "Delivered", desc: "Delivered to your shipping address." },
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
      // Fallback demo for previewing tracking UI
      if (cleanId.includes("DEMO") || cleanId.includes("ROYAL") || cleanId.includes("SAMPLE")) {
        setOrder({
          order_id: cleanId,
          status: "dispatched",
          payment_status: "paid",
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          tracking_number: "BD-982410982",
          courier: "BlueDart Express",
          estimated_delivery: "Within 2–3 Days",
          items: [
            { slug: "blonde-amber", name: "Blonde Amber", size: "50 ml", price: 1599, qty: 1, image: "/images/blonde-amber.jpg" },
            { slug: "layton", name: "Layton", size: "50 ml", price: 1499, qty: 1, image: "/images/layton.jpg" }
          ],
          subtotal: 3098,
          shipping: 0,
          total: 3098,
          address: {
            name: "Aarav Sharma",
            street: "Flat 402, Sea Green Apartments, Bandra West",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400050",
            phone: "+91 98200 48291"
          }
        });
      } else {
        setError(formatErr(err) || "No order found with this ID. Please double check and try again.");
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
    setOrderId("HOTK-DEMO");
    setEmail("aarav@example.com");
    fetchOrder("HOTK-DEMO", "aarav@example.com");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepIndex = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return 3;
    if (s === "dispatched" || s === "in_transit") return 2;
    if (s === "processing" || s === "packed") return 1;
    return 0;
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
              Order Status & Tracking
            </span>
          </div>

          <h1 className="hero-title mt-4 font-display tracking-tight text-foreground">
            Track your <span className="font-display-italic text-gold">order.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            Enter your Order ID below to check live courier updates and estimated delivery.
          </p>
        </div>

        {/* ======================================================== */}
        {/* SEARCH TERMINAL                                          */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-10 rounded-[2rem] border border-border/60 bg-card/40 p-6 shadow-xl backdrop-blur-md sm:p-10"
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
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Track Package <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Assist */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-5 text-xs text-muted-foreground">
            <span className="text-[0.68rem] tracking-wide">
              Order ID sent to your confirmation email upon checkout.
            </span>
            <button
              type="button"
              onClick={loadDemo}
              className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold transition-colors hover:text-foreground"
            >
              Try Demo Order (HOTK-DEMO)
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
                      Ordered on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
                    </p>
                  </div>

                  {/* Courier & ETA block */}
                  <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-border/50 bg-background/50 p-4 sm:gap-8">
                    <div>
                      <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                        Courier Partner
                      </p>
                      <p className="mt-1 font-display text-sm font-semibold text-foreground">
                        {order.courier || "BlueDart Express"}
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
                      <span>Shipping</span>
                      <span className="text-foreground font-medium text-xs">
                        {order.shipping ? inr(order.shipping) : "Free"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-3 font-display text-lg text-foreground">
                      <span>Total</span>
                      <span className="text-gold">{inr(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address & Transit Note */}
                <div className="space-y-6 lg:col-span-5">
                  <div className="rounded-[2rem] border border-border/60 bg-card/40 p-6 sm:p-8">
                    <h3 className="font-display text-xl text-foreground">Shipping Address</h3>
                    {order.address ? (
                      <div className="mt-4 text-sm leading-relaxed text-muted-foreground space-y-1">
                        <p className="font-display font-medium text-foreground text-base">{order.address.name}</p>
                        <p>{order.address.street}</p>
                        <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                        <p className="pt-2 text-xs font-mono text-foreground/70">Phone: {order.address.phone}</p>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground">Address on file with courier.</p>
                    )}
                  </div>

                  <div className="rounded-[2rem] border border-gold/30 bg-gold/5 p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-gold" />
                      <h4 className="font-display text-lg text-foreground">Transit Protection</h4>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      All bottles are packed with protective bubble wrap. If your package arrives damaged or leaking, reach out to our team with a photo and we'll arrange a prompt replacement.
                    </p>
                    <Link
                      to="/contact"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold hover:underline"
                    >
                      Contact Support <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* THREE SIMPLE PACKAGING & DELIVERY STANDARDS               */}
        {/* ======================================================== */}
        <div className="mt-20 border-t border-border/40 pt-14">
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-gold">
            Delivery & Packaging
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FadeUp delay={0.1} className="rounded-2xl border border-border/40 bg-card/20 p-6">
              <Box className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <h4 className="mt-4 font-display text-lg text-foreground">Secure Packaging</h4>
              <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                Every bottle is wrapped with multi-layer bubble wrap and sturdy outer boxing to prevent transit breakage.
              </p>
            </FadeUp>

            <FadeUp delay={0.2} className="rounded-2xl border border-border/40 bg-card/20 p-6">
              <ShieldCheck className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <h4 className="mt-4 font-display text-lg text-foreground">Damage Replacement</h4>
              <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                In the rare case of transit damage or leaks, message us with photos and we will send a replacement.
              </p>
            </FadeUp>

            <FadeUp delay={0.3} className="rounded-2xl border border-border/40 bg-card/20 p-6">
              <Package className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <h4 className="mt-4 font-display text-lg text-foreground">Plain Outer Box</h4>
              <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                Orders are shipped in plain, clean courier packaging for safe and discreet delivery right to your door.
              </p>
            </FadeUp>
          </div>
        </div>
      </div>
    </main>
  );
}
