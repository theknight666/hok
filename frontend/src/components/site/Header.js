import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, ShoppingBag, User, Menu, Crown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { KnightMark, Wordmark } from "./Logo";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { to: "/collection", label: "Collection" },
  { to: "/#armoury", label: "Armoury" },
  { to: "/#house", label: "The House" },
];

function IconBtn({ children, ...p }) {
  return (
    <button className="relative grid h-10 w-10 place-items-center rounded-full transition-colors duration-300 hover:bg-foreground hover:text-background" {...p}>
      {children}
    </button>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    let ticking = false;
    const on = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const compact = scrolled || pathname !== "/";

  return (
    <header data-testid="site-header" className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`mx-auto flex h-16 max-w-[1600px] items-center justify-between rounded-full border px-3 pl-5 text-foreground backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ${
          compact ? "border-border/60 bg-background/85 shadow-lg" : "border-background/40 bg-background/60"
        }`}
      >
        <Link to="/" data-testid="brand-logo" className="flex items-center gap-3">
          <KnightMark className="h-8 w-8" />
          <Wordmark className="hidden sm:inline" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="rounded-full px-4 py-2 text-[0.66rem] font-medium uppercase tracking-[0.3em] transition-colors duration-300 hover:bg-foreground hover:text-background"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {user?.role === "admin" && (
            <Link to="/admin" data-testid="nav-admin" className="hidden items-center gap-2 rounded-full bg-gold px-4 py-2 text-[0.66rem] font-medium uppercase tracking-[0.3em] text-[#0C0B0E] sm:flex">
              <Crown className="h-4 w-4" strokeWidth={2.4} /> Admin
            </Link>
          )}
          <IconBtn onClick={toggle} data-testid="theme-toggle" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" strokeWidth={2.2} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={2.2} />}
          </IconBtn>
          <Link to={user ? "/account" : "/login"} data-testid="nav-account" className="hidden h-10 w-10 place-items-center rounded-full transition-colors duration-300 hover:bg-foreground hover:text-background sm:grid">
            <User className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </Link>
          <button
            onClick={() => setOpen(true)}
            data-testid="cart-open-btn"
            aria-label="Open bag"
            className="ml-1 flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-background transition-transform duration-300 hover:scale-105"
          >
            <ShoppingBag className="h-[16px] w-[16px]" strokeWidth={2.4} />
            <span className="text-xs font-medium tabular-nums" data-testid="cart-count">{count}</span>
          </button>
          <Sheet>
            <SheetTrigger asChild>
              <button data-testid="mobile-menu-btn" className="grid h-10 w-10 place-items-center rounded-full md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" strokeWidth={2.2} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] max-w-sm bg-background">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Browse the House of the Knight collection and your account.</SheetDescription>
              <div className="mt-16 flex flex-col gap-6">
                {LINKS.map((l) => (
                  <Link key={l.to} to={l.to} data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`} className="font-display text-5xl">
                    {l.label}
                  </Link>
                ))}
                <Link to={user ? "/account" : "/login"} data-testid="mobile-nav-account" className="font-display text-5xl">
                  Account
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
