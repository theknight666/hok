import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { KnightMark } from "./Logo";

const COLS = [
  { t: "Shop", links: [["/collection", "All fragrances"], ["/discovery", "Discovery Sets"], ["/#best-sellers", "Best sellers"], ["/track", "Track your order"], ["/checkout", "Checkout"]] },
  { t: "House", links: [["/#house", "Why the House"], ["/contact", "Contact concierge"], ["/account", "My account", "footer-account"], ["/login", "Sign in"]] },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const footerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start 0.95", "end end"],
  });

  // Enhanced parallax by 150% with high scroll sensitivity (150px vertical travel range)
  const textY = useTransform(scrollYProgress, [0, 1], [105, -45]);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail("");
  };

  return (
    <footer ref={footerRef} className="relative overflow-hidden bg-foreground text-background" data-testid="site-footer">
      <div className="mx-auto max-w-[1600px] px-5 pt-6 sm:pt-8 sm:px-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <KnightMark variant="dark" className="h-36 w-36 sm:h-48 sm:w-48 hidden dark:inline-flex" />
            <KnightMark variant="gold" className="h-36 w-36 sm:h-48 sm:w-48 inline-flex dark:hidden" />
            <p className="mt-2 sm:mt-3 max-w-md font-display text-4xl leading-[0.95] sm:text-5xl">Stay in the know. New drops, rare finds, no noise.</p>
            <form onSubmit={subscribe} className="mt-10 max-w-md" data-testid="newsletter-form">
              {sent ? (
                <p className="rounded-full border border-background/30 px-6 py-4 text-sm font-semibold" data-testid="newsletter-success">You're in. Watch your inbox.</p>
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
          {COLS.map((c) => (
            <div key={c.t} className="lg:col-span-3">
              <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-gold">{c.t}</p>
              <ul className="mt-5 space-y-3 text-base font-semibold">
                {c.links.map(([to, label, tid]) => (
                  <li key={to + label}><Link to={to} data-testid={tid} className="link-line opacity-80 transition-opacity hover:opacity-100">{label}</Link></li>
                ))}
              </ul>
              {c.t === "House" && <p className="mt-6 text-sm opacity-50">concierge@houseoftheknight.com</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Full-Width End-to-End Giant Screen-Fitting Banner with Parallax */}
      <div className="relative mt-6 sm:mt-8 w-full overflow-hidden select-none pointer-events-none pb-0 pt-0">
        <motion.div
          style={{ y: textY }}
          className="w-full will-change-transform transform-gpu flex items-center justify-center"
        >
          <p
            className="w-full text-center font-display font-bold leading-[0.92] tracking-tight whitespace-nowrap text-[13.6vw] sm:text-[13.7vw] lg:text-[13.8vw] text-background selection:bg-transparent"
            aria-hidden="true"
          >
            House of the Knight
          </p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 pb-8 sm:px-10">
        <div className="mt-1 flex flex-col justify-between gap-3 border-t border-background/15 pt-5 text-xs font-semibold opacity-60 sm:flex-row">
          <span>© {new Date().getFullYear()} House Of The Knight. All rights reserved.</span>
          <span className="uppercase tracking-[0.2em]">Extrait de Parfum · Made with obsession</span>
        </div>
      </div>
    </footer>
  );
}
