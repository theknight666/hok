import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { KnightMark } from "./Logo";

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
    <footer className="relative overflow-hidden bg-[#0B0A09] text-[#E9E2D2]" data-testid="site-footer">
      <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-24 sm:px-10">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <KnightMark className="h-12 w-12 text-[#D9B56A]" />
            <p className="mt-6 max-w-sm font-display text-3xl leading-snug">Armour for the senses. Four signatures, one House.</p>
            <form onSubmit={subscribe} className="mt-10 max-w-sm" data-testid="newsletter-form">
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#D9B56A]">Join the House</p>
              {sent ? (
                <p className="mt-4 text-sm text-[#C9BFAE]" data-testid="newsletter-success">Welcome. Watch your inbox for private releases.</p>
              ) : (
                <div className="mt-4 flex items-center border-b border-white/25 focus-within:border-[#D9B56A]">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    data-testid="newsletter-input"
                    className="w-full bg-transparent py-3 text-sm text-[#E9E2D2] placeholder:text-[#6E6860] focus:outline-none"
                  />
                  <button type="submit" data-testid="newsletter-submit" aria-label="Subscribe" className="grid h-10 w-10 shrink-0 place-items-center text-[#D9B56A] transition-transform duration-300 hover:translate-x-1">
                    <ArrowRight className="h-5 w-5" strokeWidth={1.3} />
                  </button>
                </div>
              )}
            </form>
          </div>
          <div className="md:col-span-3 md:col-start-7">
            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#D9B56A]">The House</p>
            <ul className="mt-5 space-y-3 text-sm text-[#C9BFAE]">
              <li><Link to="/#collection" className="link-line transition-colors hover:text-white">Collection</Link></li>
              <li><Link to="/#atelier" className="link-line transition-colors hover:text-white">Atelier</Link></li>
              <li><Link to="/#notes" className="link-line transition-colors hover:text-white">Scent notes</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#D9B56A]">Client Services</p>
            <ul className="mt-5 space-y-3 text-sm text-[#C9BFAE]">
              <li><Link to="/account" className="link-line transition-colors hover:text-white" data-testid="footer-account">My account</Link></li>
              <li><Link to="/checkout" className="link-line transition-colors hover:text-white">Checkout</Link></li>
              <li><span className="text-[#6E6860]">concierge@houseoftheknight.com</span></li>
            </ul>
          </div>
        </div>
        <p className="pointer-events-none mt-20 select-none whitespace-nowrap font-display text-[17vw] leading-[0.8] tracking-tight md:text-[13vw]" style={{ color: "transparent", WebkitTextStroke: "1px rgba(217,181,106,0.35)" }}>
          The Knight
        </p>
        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-white/10 pt-8 text-xs text-[#6E6860] sm:flex-row">
          <span>© {new Date().getFullYear()} House Of The Knight. All rights reserved.</span>
          <span className="uppercase tracking-[0.3em]">Haute Parfumerie · London · Paris</span>
        </div>
      </div>
    </footer>
  );
}
