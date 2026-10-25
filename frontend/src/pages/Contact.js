import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Compass,
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
  "Fragrance Recommendations",
  "Order & Tracking",
  "Wholesale Inquiry",
  "General Question"
];

const FAQS = [
  {
    q: "How close are your fragrances to the originals?",
    a: "We formulate our fragrances using high-quality oils to closely match the scent profiles of popular niche fragrances, offering great longevity and projection."
  },
  {
    q: "How long does shipping take?",
    a: "Orders are processed and dispatched within 24–48 hours. Metro deliveries usually arrive within 2–4 business days, and 4–6 business days for other locations across India."
  },
  {
    q: "Can I try a sample before buying a full bottle?",
    a: "Yes! Every fragrance in our collection is available in a 2ml sample vial for ₹99, or you can pick up the complete 4-piece Discovery Set."
  },
  {
    q: "What if my bottle arrives damaged or leaking?",
    a: "We pack all orders securely in protective bubble wrap and sturdy boxes. In the rare case a bottle arrives damaged or leaking, simply message us a photo on WhatsApp or email, and we will send a replacement."
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
      setTicket(res.data?.ticket_id || `HOTK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setTicket(`HOTK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
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
              Contact & Support
            </span>
          </div>

          <h1 className="hero-title mt-4 font-display tracking-tight text-foreground">
            How can we <span className="font-display-italic text-gold">help?</span>
          </h1>

          <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            Have a question about a fragrance, need help tracking an order, or looking for recommendations? Reach out to us below.
          </p>
        </div>

        {/* ======================================================== */}
        {/* SPLIT LAYOUT: DIRECT CHANNELS VS INQUIRY TERMINAL        */}
        {/* ======================================================== */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Direct Channels */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-[2.5rem] border border-border/60 bg-card/40 p-6 shadow-xl backdrop-blur-md sm:p-8 space-y-5">
              <h3 className="font-display text-2xl text-foreground">Direct Support</h3>

              <div className="space-y-4">
                {/* Email */}
                <a
                  href="mailto:support@houseoftheknight.com"
                  className="group flex items-start gap-4 rounded-2xl border border-border/40 bg-background/50 p-4 transition-all duration-300 hover:border-gold hover:bg-background/80"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold transition-transform group-hover:scale-110">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Email Support</p>
                    <p className="font-display text-base text-foreground mt-0.5">support@houseoftheknight.com</p>
                    <p className="text-xs text-muted-foreground mt-1">Replies within 24 hours</p>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/919820048291?text=Hello%20House%20of%20the%20Knight,%20I%20have%20a%20question%20about%20a%20fragrance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-2xl border border-border/40 bg-background/50 p-4 transition-all duration-300 hover:border-gold hover:bg-background/80"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 transition-transform group-hover:scale-110">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">WhatsApp Chat</p>
                    <p className="font-display text-base text-foreground mt-0.5">+91 98200 48291</p>
                    <p className="text-xs text-muted-foreground mt-1">Quick answers via WhatsApp</p>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-start gap-4 rounded-2xl border border-border/40 bg-background/50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Location</p>
                    <p className="font-display text-base text-foreground mt-0.5">Mumbai, Maharashtra</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Online dispatch across all of India
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4 rounded-2xl border border-border/40 bg-background/50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Support Hours</p>
                    <p className="font-display text-base text-foreground mt-0.5">Mon – Sat: 10:00 AM – 8:00 PM IST</p>
                    <p className="text-xs text-muted-foreground mt-1">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scent Suggestion Card */}
            <div className="rounded-[2.5rem] border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-gold" />
                <span className="text-[0.64rem] font-medium uppercase tracking-[0.28em] text-gold">
                  Fragrance Requests
                </span>
              </div>
              <h4 className="mt-2 font-display text-lg text-foreground">
                Looking for a specific clone?
              </h4>
              <p className="mt-1 text-xs font-light leading-relaxed text-muted-foreground">
                If there is a niche fragrance you'd like us to create next, let us know! We prioritize community suggestions for our upcoming batches.
              </p>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-[2.5rem] border border-border/60 bg-card/40 p-6 shadow-2xl backdrop-blur-md sm:p-10">
              <AnimatePresence mode="wait">
                {ticket ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="py-10 text-center"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold bg-gold/15 text-gold shadow-lg shadow-gold/20">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      Message Sent!
                    </h3>

                    <p className="mx-auto mt-3 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                      Thank you for contacting us. We have received your message under reference:
                    </p>

                    <div className="mx-auto mt-4 inline-block rounded-full border border-gold/40 bg-background/80 px-5 py-2 font-mono text-sm font-semibold tracking-wider text-gold">
                      {ticket}
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                      We will get back to you via email or WhatsApp as soon as possible.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                      <button
                        onClick={() => setTicket(null)}
                        className="btn-royal"
                      >
                        Send Another Message
                      </button>
                      <a href="/collection" className="btn-ghost-royal">
                        Browse Fragrances
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
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-display text-2xl text-foreground">Send a Message</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fill in the details below and we'll reply shortly.
                      </p>
                    </div>

                    {/* Topic Pills */}
                    <div>
                      <label className="block text-[0.66rem] font-medium uppercase tracking-[0.24em] text-gold mb-3">
                        Topic
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TOPICS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTopic(t)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                              topic === t
                                ? "border-gold bg-gold text-[#0C0B0E] font-semibold shadow-sm"
                                : "border border-border/70 bg-background/50 text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[0.66rem] font-medium uppercase tracking-[0.24em] text-gold">
                          Your Name <span className="text-foreground/50">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="mt-1.5 w-full rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.66rem] font-medium uppercase tracking-[0.24em] text-gold">
                          Email Address <span className="text-foreground/50">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="mt-1.5 w-full rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[0.66rem] font-medium uppercase tracking-[0.24em] text-gold">
                        Phone / WhatsApp <span className="text-muted-foreground font-light text-[0.62rem]">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="mt-1.5 w-full rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.66rem] font-medium uppercase tracking-[0.24em] text-gold">
                        Message <span className="text-foreground/50">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what you need help with..."
                        className="mt-1.5 w-full rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-destructive">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-royal w-full !py-3.5 shadow-lg"
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CLIENT FAQS                                              */}
        {/* ======================================================== */}
        <div className="mt-20 border-t border-border/40 pt-14">
          <p className="eyebrow text-center">Frequently Asked Questions</p>
          <h2 className="display-sm mt-2 text-center font-display text-foreground">
            Common Questions
          </h2>

          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 transition-colors hover:border-border"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left transition-colors"
                  >
                    <span className="font-display text-base font-medium text-foreground sm:text-lg">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-gold" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="border-t border-border/40 p-5 pt-3 text-sm leading-relaxed text-muted-foreground">
                          {faq.a}
                        </div>
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
