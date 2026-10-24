import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { KnightMark } from "./Logo";

const COLS = [
  { t: "Shop", links: [["/collection", "All fragrances"], ["/#best-sellers", "Best sellers"], ["/track", "Track your order"], ["/checkout", "Checkout"]] },
  { t: "House", links: [["/#house", "Why the House"], ["/contact", "Contact concierge"], ["/account", "My account", "footer-account"], ["/login", "Sign in"]] },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail("");
  };

  return (
    <footer className="relative overflow-hidden bg-foreground text-background" data-testid="site-footer">
      <div className="mx-auto max-w-[1600px] px-5 pt-24 sm:px-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <KnightMark className="h-12 w-12 text-gold" />
            <p className="mt-6 max-w-md font-display text-4xl leading-[0.95] sm:text-5xl">Stay in the know. New drops, rare finds, no noise.</p>
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

      {/* Full-Width Mathematically Centered Giant Watermark */}
      <div className="relative mt-20 sm:mt-24 flex w-full items-center justify-center overflow-hidden px-4">
        <p
          className="pointer-events-none select-none whitespace-nowrap text-center font-display leading-[0.8] tracking-tight text-[clamp(2.4rem,8.8vw,9.6rem)] text-background"
          aria-hidden="true"
        >
          House of the Knight
        </p>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 pb-8 sm:px-10">
        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-background/15 pt-6 text-xs font-semibold opacity-60 sm:flex-row">
          <span>© {new Date().getFullYear()} House Of The Knight. All rights reserved.</span>
          <span className="uppercase tracking-[0.2em]">Extrait de Parfum · Made with obsession</span>
        </div>
      </div>
    </footer>
  );
}
