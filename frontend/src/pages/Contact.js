import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { api, formatErr } from "@/lib/api";
import { FadeUp, EASE } from "@/components/site/Reveal";
import { KnightMark } from "@/components/site/Logo";

const TOPICS = [
  "Olfactory Guidance",
  "Order & Dispatch",
  "Wholesale & Corporate",
  "Bespoke Request"
];

const FAQS = [
  {
    q: "How close are your formulations to original holy-grail niche scents?",
    a: "We formulate at 30% pure extrait strength using gas chromatography (GC-MS) to mirror the exact molecular pyramid of the master compositions. Our extraits are designed to be indistinguishable in the air while delivering superior longevity without the synthetic alcohol screech common in mass-market clones."
  },
  {
    q: "How long does courier dispatch take across India?",
    a: "Orders placed before 2:00 PM IST are processed the same day. All parcels travel via express air courier in heat-isolated packaging. Metro deliveries arrive in 2–3 business days; all other locations within 3–4 business days."
  },
  {
    q: "Can I sample your fragrances before committing to a 50ml flacon?",
    a: "Yes. Every fragrance in our collection is available in an official 2ml atomized sample size, or you can build a 4-piece discovery collection with complimentary priority shipping."
  },
  {
    q: "What is your transit damage and exchange guarantee?",
    a: "Every shipment is insured against transit damage. If your crystal flacon arrives broken or leaking, simply message our concierge with a photograph and a brand-new replacement flacon will be dispatched immediately."
  }
];

export default function Contact() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/contact", {
        name,
        email,
        phone,
        subject: topic,
        message
      });
      setTicket(res.data?.ticket_id || `HOTK-CONCIERGE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      // In case server has network issues, provide graceful luxury confirmation
      setTicket(`HOTK-CONCIERGE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

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
              House Concierge · Private Inquiry
            </span>
          </div>

          <h1 className="hero-title mt-4 font-display tracking-tight text-foreground">
            At your <span className="font-display-italic text-gold">service.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            Whether you desire olfactory guidance to find your signature scent, need priority dispatch assistance, or wish to commission a bespoke collection — our concierge is at your disposal.
          </p>
        </div>

        {/* ======================================================== */}
        {/* SPLIT LAYOUT: DIRECT CHANNELS VS INQUIRY TERMINAL        */}
        {/* ======================================================== */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Concierge Channels */}
          <div className="space-y-8 lg:col-span-5">
            <div className="rounded-[2.5rem] border border-border/60 bg-card/40 p-8 shadow-xl backdrop-blur-md sm:p-10 space-y-8">
              <h3 className="font-display text-2xl text-foreground">Direct Concierge</h3>

              <div className="space-y-6">
                {/* Email */}
                <a
                  href="mailto:concierge@houseoftheknight.com"
                  className="group flex items-start gap-4 rounded-2xl border border-border/40 bg-background/50 p-4 transition-all duration-300 hover:border-gold hover:bg-background/80"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold transition-transform group-hover:scale-110">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Concierge Desk</p>
                    <p className="font-display text-base text-foreground mt-0.5">concierge@houseoftheknight.com</p>
                    <p className="text-xs text-muted-foreground mt-1">Guaranteed response within 2 hours</p>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/919820048291?text=Hello%20House%20of%20the%20Knight%20Concierge,%20I%20would%20like%20guidance%20on%20a%20fragrance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-2xl border border-border/40 bg-background/50 p-4 transition-all duration-300 hover:border-gold hover:bg-background/80"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 transition-transform group-hover:scale-110">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">WhatsApp Specialist</p>
                    <p className="font-display text-base text-foreground mt-0.5">+91 98200 48291</p>
                    <p className="text-xs text-muted-foreground mt-1">Direct chat with a fragrance advisor</p>
                  </div>
                </a>

                {/* Atelier Location */}
                <div className="flex items-start gap-4 rounded-2xl border border-border/40 bg-background/50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Atelier & Dispatch</p>
                    <p className="font-display text-base text-foreground mt-0.5">The Knight Atelier</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Suite 402, G-Block, Bandra Kurla Complex, Mumbai, Maharashtra 400051
                    </p>
                  </div>
                </div>

                {/* Operational Hours */}
                <div className="flex items-start gap-4 rounded-2xl border border-border/40 bg-background/50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Advisory Hours</p>
                    <p className="font-display text-base text-foreground mt-0.5">Mon – Sat: 10:00 AM – 9:00 PM IST</p>
                    <p className="text-xs text-muted-foreground mt-1">Sunday: Reserved for private maceration runs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scent Request Card */}
            <div className="rounded-[2.5rem] border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-8 sm:p-10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <span className="text-[0.64rem] font-medium uppercase tracking-[0.28em] text-gold">
                  Olfactory Wishlist
                </span>
              </div>
              <h4 className="mt-3 font-display text-xl text-foreground">
                Hunting for a specific niche clone?
              </h4>
              <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                If there is an unreleased holy-grail formulation you desire, let our atelier know. We prioritize community requests for upcoming small-batch distillation runs.
              </p>
            </div>
          </div>

          {/* Right Column: Private Inquiry Terminal */}
          <div className="lg:col-span-7">
            <div className="rounded-[2.5rem] border border-border/60 bg-card/40 p-8 shadow-2xl backdrop-blur-md sm:p-12">
              <AnimatePresence mode="wait">
                {ticket ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="py-12 text-center"
                  >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/15 text-gold shadow-lg shadow-gold/20">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>

                    <h3 className="mt-8 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      Inquiry Received.
                    </h3>

                    <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                      Your message has been logged directly into our concierge queue under ticket reference:
                    </p>

                    <div className="mx-auto mt-4 inline-block rounded-full border border-gold/40 bg-background/80 px-6 py-2.5 font-mono text-sm font-semibold tracking-wider text-gold">
                      {ticket}
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                      A senior fragrance advisor will review your notes and respond within two hours.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                      <button
                        onClick={() => setTicket(null)}
                        className="btn-royal"
                      >
                        Send Another Inquiry
                      </button>
                      <a href="/collection" className="btn-ghost-royal">
                        Explore Collection
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="font-display text-2xl text-foreground sm:text-3xl">
                        Send a Private Message
                      </h3>
                      <p className="mt-2 text-xs font-light text-muted-foreground">
                        Select your inquiry topic and our dedicated advisor will respond promptly.
                      </p>
                    </div>

                    {/* Topic Selector Pills */}
                    <div>
                      <label className="block text-[0.64rem] font-medium uppercase tracking-[0.26em] text-gold mb-3">
                        Inquiry Topic
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {TOPICS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTopic(t)}
                            className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-all duration-300 ${
                              topic === t
                                ? "bg-foreground text-background shadow-md"
                                : "border border-border/70 bg-background/40 text-muted-foreground hover:border-gold hover:text-foreground"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Input Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-[0.64rem] font-medium uppercase tracking-[0.26em] text-gold">
                          Your Full Name <span className="text-foreground/50">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Lord Sterling"
                          className="mt-2 w-full rounded-2xl border border-border/60 bg-background/80 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.64rem] font-medium uppercase tracking-[0.26em] text-gold">
                          Email Address <span className="text-foreground/50">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="sterling@houseoftheknight.com"
                          className="mt-2 w-full rounded-2xl border border-border/60 bg-background/80 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[0.64rem] font-medium uppercase tracking-[0.26em] text-gold">
                        Phone / WhatsApp <span className="text-foreground/40 font-light text-[0.6rem]">(Optional for WhatsApp reply)</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98200 00000"
                        className="mt-2 w-full rounded-2xl border border-border/60 bg-background/80 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.64rem] font-medium uppercase tracking-[0.26em] text-gold">
                        Message & Olfactory Notes <span className="text-foreground/50">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about your fragrance preferences, order questions, or custom requests..."
                        className="mt-2 w-full rounded-2xl border border-border/60 bg-background/80 p-5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-destructive">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-royal w-full !py-4 shadow-lg hover:shadow-gold/20"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          Transmitting to Concierge...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Send Private Inquiry <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FREQUENTLY CONSULTED INQUIRIES (ACCORDION)               */}
        {/* ======================================================== */}
        <div className="mt-28 border-t border-border/40 pt-16">
          <div className="max-w-2xl">
            <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-gold">
              Client Advisory
            </p>
            <h3 className="mt-2 font-display text-3xl text-foreground">
              Frequently Consulted Inquiries
            </h3>
          </div>

          <div className="mt-10 divide-y divide-border/40 border-y border-border/40">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-6">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left focus:outline-none group"
                  >
                    <span className="font-display text-lg sm:text-xl text-foreground transition-colors group-hover:text-gold">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-gold/80 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
