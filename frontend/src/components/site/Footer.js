import { Link } from "react-router-dom";
import { KnightMark } from "./Logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t bg-background" data-testid="site-footer">
      <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-24 sm:px-10">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <KnightMark className="h-12 w-12 text-gold" />
            <p className="mt-6 max-w-sm font-display text-3xl leading-snug">Armour for the senses. Four signatures, one House.</p>
          </div>
          <div className="md:col-span-3 md:col-start-7">
            <p className="eyebrow">The House</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/#collection" className="link-line">Collection</Link></li>
              <li><Link to="/#atelier" className="link-line">Atelier</Link></li>
              <li><Link to="/#notes" className="link-line">Scent notes</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow">Client Services</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/account" className="link-line" data-testid="footer-account">My account</Link></li>
              <li><Link to="/checkout" className="link-line">Checkout</Link></li>
              <li><span className="text-muted-foreground">[contact email]</span></li>
            </ul>
          </div>
        </div>
        <p className="pointer-events-none mt-20 select-none whitespace-nowrap font-display text-[17vw] leading-[0.8] tracking-tight text-outline md:text-[13vw]">
          The Knight
        </p>
        <div className="mt-8 flex flex-col justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} House Of The Knight. All rights reserved.</span>
          <span className="uppercase tracking-[0.3em]">Haute Parfumerie</span>
        </div>
      </div>
    </footer>
  );
}
