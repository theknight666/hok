import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { KnightMark } from "./Logo";

const COLS = [
  { t: "Shop", links: [["/collection", "All fragrances"], ["/discovery", "Discovery Sets"], ["/#best-sellers", "Best sellers"], ["/track", "Track your order"], ["/checkout", "Checkout"]] },
  { t: "House", links: [["/#house", "Why the House"], ["/contact", "Contact concierge"], ["/account", "My account", "footer-account"], ["/login", "Sign in"]] },
];

function InstagramIcon({ className = "h-4.5 w-4.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function RedditIcon({ className = "h-4.5 w-4.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.702zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4.5 w-4.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.031 0C5.395 0 .012 5.383.012 12.019c0 2.12.553 4.19 1.606 6.012L0 24l6.16-1.615a12.012 12.012 0 0 0 5.867 1.517h.005c6.636 0 12.02-5.383 12.02-12.02 0-3.21-1.249-6.226-3.522-8.5C18.257 1.11 15.242 0 12.031 0zm0 21.986h-.004a9.98 9.98 0 0 1-5.088-1.39l-.365-.216-3.778.99.101-3.682-.238-.378a9.99 9.99 0 0 1-1.536-5.29c0-5.518 4.49-10.008 10.012-10.008 2.673 0 5.186 1.042 7.078 2.934a9.96 9.96 0 0 1 2.93 7.077c0 5.519-4.49 10.01-10.01 10.01zm5.485-7.5c-.3-.15-1.777-.878-2.052-.978-.276-.1-.476-.15-.676.15-.2.3-.776.978-.952 1.178-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.49-.893-.796-1.495-1.78-1.67-2.08-.176-.3-.019-.462.13-.611.136-.134.301-.35.451-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.63-.926-2.23-.243-.585-.49-.506-.676-.515-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375-.276.3-1.052 1.028-1.052 2.508 0 1.48 1.077 2.91 1.227 3.11.15.2 2.12 3.237 5.136 4.54.717.31 1.277.495 1.713.633.72.228 1.376.196 1.894.118.578-.087 1.777-.726 2.027-1.428.25-.702.25-1.303.175-1.428-.075-.125-.275-.2-.575-.35z"/>
    </svg>
  );
}

function XIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function SocialLinks() {
  return (
    <div className="flex flex-col gap-2.5 pb-2" data-testid="footer-socials">
      <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-gold">Join The Circle</p>
      <div className="flex items-center gap-2.5">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          title="Follow House of the Knight on Instagram"
          className="grid h-10 w-10 place-items-center rounded-full border border-background/25 bg-background/5 text-background/80 transition-all duration-300 hover:scale-110 hover:border-gold hover:bg-gold/15 hover:text-gold cursor-pointer"
        >
          <InstagramIcon />
        </a>
        <a
          href="https://reddit.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Reddit"
          title="Join the House of the Knight Community on Reddit"
          className="grid h-10 w-10 place-items-center rounded-full border border-background/25 bg-background/5 text-background/80 transition-all duration-300 hover:scale-110 hover:border-gold hover:bg-gold/15 hover:text-gold cursor-pointer"
        >
          <RedditIcon />
        </a>
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          title="Chat with House Concierge on WhatsApp"
          className="grid h-10 w-10 place-items-center rounded-full border border-background/25 bg-background/5 text-background/80 transition-all duration-300 hover:scale-110 hover:border-gold hover:bg-gold/15 hover:text-gold cursor-pointer"
        >
          <WhatsAppIcon />
        </a>
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter)"
          title="Follow House of the Knight on X"
          className="grid h-10 w-10 place-items-center rounded-full border border-background/25 bg-background/5 text-background/80 transition-all duration-300 hover:scale-110 hover:border-gold hover:bg-gold/15 hover:text-gold cursor-pointer"
        >
          <XIcon />
        </a>
      </div>
    </div>
  );
}

const PAYMENT_BADGES = [
  { name: "Visa", file: "visa.svg" },
  { name: "Mastercard", file: "mastercard.svg" },
  { name: "RuPay", file: "rupay.svg" },
  { name: "UPI", file: "upi.svg" },
  { name: "Google Pay", file: "gpay.svg" },
  { name: "PhonePe", file: "phonepe.svg" },
  { name: "Paytm", file: "paytm.svg" },
  { name: "American Express", file: "amex.svg" },
  { name: "Apple Pay", file: "apple-pay.svg" },
  { name: "PayPal", file: "paypal.svg" },
  { name: "Amazon Pay", file: "amazon.svg" },
  { name: "Net Banking", file: "netbanking.svg" },
  { name: "Razorpay", file: "razorpay.svg" },
  { name: "Stripe", file: "stripe.svg" },
  { name: "Samsung Pay", file: "samsung_pay.svg" },
  { name: "Maestro", file: "maestro.svg" },
  { name: "Diners Club", file: "diners.svg" },
  { name: "Discover", file: "discover.svg" },
  { name: "JCB", file: "jcb.svg" },
];

function PaymentBadges() {
  return (
    <div className="mt-8 lg:mt-6 pt-6 border-t border-background/15" data-testid="payment-trust-badges">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <p className="text-[0.66rem] font-medium uppercase tracking-[0.25em] text-gold flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-gold shrink-0" />
          <span>Guaranteed Safe &amp; Secure Checkout</span>
        </p>
        <span className="text-[10px] uppercase font-mono tracking-wider opacity-60 flex items-center gap-1">
          <Lock className="h-3 w-3 shrink-0" />
          <span>256-Bit SSL Encrypted</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {PAYMENT_BADGES.map((b) => (
          <img
            key={b.file}
            src={`/images/payments/${b.file}`}
            alt={b.name}
            title={b.name}
            className="h-7 w-auto object-contain rounded transition-transform duration-200 hover:scale-110 shadow-sm cursor-default"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}

function IndianFlag({ className = "inline-block h-3 w-[18px] rounded-[1.5px] shadow-sm overflow-hidden shrink-0 -translate-y-[1px]" }) {
  return (
    <svg
      viewBox="0 0 225 150"
      className={className}
      aria-label="India"
      role="img"
    >
      <rect width="225" height="50" fill="#FF9933" />
      <rect y="50" width="225" height="50" fill="#FFFFFF" />
      <rect y="100" width="225" height="50" fill="#138808" />
      <g transform="translate(112.5, 75)">
        <circle r="19" fill="none" stroke="#000080" strokeWidth="2" />
        <circle r="3.5" fill="#000080" />
        {[...Array(24)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="0"
            x2="0"
            y2="-19"
            stroke="#000080"
            strokeWidth="1.2"
            transform={`rotate(${i * 15})`}
          />
        ))}
      </g>
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const footerRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleNavClick = (e, to) => {
    if (to.startsWith("/#")) {
      e.preventDefault();
      const targetHash = to.replace("/", "");
      const targetId = targetHash.replace("#", "");

      const performScroll = () => {
        const el = document.getElementById(targetId) || document.querySelector(targetHash);
        if (el) {
          if (window.__lenis) {
            window.__lenis.resize();
            window.__lenis.scrollTo(el, { offset: -85, duration: 0.85, force: true });
          } else {
            const top = el.getBoundingClientRect().top + window.scrollY - 85;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }
      };

      if (pathname !== "/") {
        navigate("/", { state: { scrollTo: targetId } });
      } else {
        performScroll();
        setTimeout(performScroll, 80);
      }
    }
  };

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  // Parallax sensitivity enhanced by 500% (400px travel), landing at -8px resting position (moved up by 2px more)
  const textY = useTransform(scrollYProgress, [0, 1], [392, -8]);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail("");
  };

  return (
    <footer ref={footerRef} className="relative overflow-hidden bg-foreground text-background" data-testid="site-footer">
      <div className="mx-auto max-w-[1600px] px-5 pt-6 sm:pt-8 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left Column (lg:col-span-6): Brand Crest, Socials (Pink Marked Area) & Newsletter */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div className="flex items-center gap-3 shrink-0">
                  <KnightMark variant="dark" className="h-32 w-32 sm:h-44 sm:w-44 hidden dark:inline-flex" />
                  <KnightMark variant="gold" className="h-32 w-32 sm:h-44 sm:w-44 inline-flex dark:hidden" />
                </div>
                {/* Socials: Instagram, Reddit, WhatsApp, X (Pink Marked Area) */}
                <SocialLinks />
              </div>

              <p className="mt-4 sm:mt-5 max-w-md font-display text-4xl leading-[0.95] sm:text-5xl">
                Stay in the know. New drops, rare finds, no noise.
              </p>
            </div>

            <form onSubmit={subscribe} className="mt-4 max-w-md" data-testid="newsletter-form">
              {sent ? (
                <p className="rounded-full border border-background/30 px-6 py-4 text-sm font-semibold" data-testid="newsletter-success">
                  You're in. Watch your inbox.
                </p>
              ) : (
                <div className="flex items-center rounded-full border-2 border-background/30 p-1.5 pl-6 focus-within:border-gold">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    data-testid="newsletter-input"
                    className="w-full bg-transparent py-2 text-sm font-medium placeholder:opacity-50 focus:outline-none"
                  />
                  <button type="submit" data-testid="newsletter-submit" aria-label="Subscribe" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-[#0C0B0E] transition-transform duration-300 hover:scale-110">
                    <ArrowRight className="h-5 w-5" strokeWidth={2.6} />
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Column (lg:col-span-6): Navigation Links & Premium Payment Trust Badges (Red Marked Area) */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <div className="grid grid-cols-2 gap-8">
              {COLS.map((c) => (
                <div key={c.t}>
                  <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-gold">{c.t}</p>
                  <ul className="mt-5 space-y-3 text-base font-semibold">
                    {c.links.map(([to, label, tid]) => (
                      <li key={to + label}>
                        <Link to={to} onClick={(e) => handleNavClick(e, to)} data-testid={tid} className="link-line opacity-80 transition-opacity hover:opacity-100">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {c.t === "House" && <p className="mt-6 text-sm opacity-50">concierge@houseoftheknight.com</p>}
                </div>
              ))}
            </div>

            {/* Red Marked Area: Premium Payment Trust Badges */}
            <PaymentBadges />
          </div>
        </div>
      </div>

      {/* Full-Width End-to-End Giant Screen-Fitting Banner with Parallax */}
      <div className="relative mt-4 sm:mt-6 w-full select-none pointer-events-none pt-4 sm:pt-6 pb-0">
        <motion.div
          style={{ y: textY }}
          className="w-full will-change-transform transform-gpu flex items-center justify-center"
        >
          <p
            className="w-full text-center font-display font-bold leading-[0.92] tracking-tight whitespace-nowrap text-[13.6vw] sm:text-[13.7vw] lg:text-[13.8vw] text-[#F0D8BB] dark:text-[#110E13] selection:bg-transparent"
            aria-hidden="true"
          >
            House of the Knight
          </p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 pb-8 sm:px-10 -mt-2 sm:-mt-4">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-background/15 pt-5 text-xs font-semibold opacity-60 sm:flex-row">
          <span className="text-center sm:flex-1 sm:text-left">© {new Date().getFullYear()} House Of The Knight. All rights reserved.</span>
          <span className="inline-flex items-center justify-center gap-1.5 text-center sm:flex-1">
            <span>Made with ❤️ in India</span>
            <IndianFlag />
          </span>
          <span className="text-center sm:flex-1 sm:text-right uppercase tracking-[0.2em]">Eau de Parfum · Made with obsession</span>
        </div>
      </div>
    </footer>
  );
}
