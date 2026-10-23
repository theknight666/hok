import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, ShoppingBag, User, Menu, Crown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { KnightMark, Wordmark } from "./Logo";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { to: "/#collection", label: "Collection" },
  { to: "/#atelier", label: "Atelier" },
  { to: "/#notes", label: "Notes" },
];

function IconBtn({ children, ...p }) {
  return (
    <button className="relative grid h-10 w-10 place-items-center transition-colors duration-300 hover:text-gold" {...p}>
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
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const solid = scrolled || pathname !== "/";

  return (
    <header
      data-testid="site-header"
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        solid ? "border-b border-border/70 bg-background/75 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-10">
        <nav className="hidden flex-1 items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} data-testid={`nav-${l.label.toLowerCase()}`} className="link-line text-[0.7rem] uppercase tracking-[0.3em]">
              {l.label}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <button data-testid="mobile-menu-btn" className="grid h-10 w-10 place-items-center md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" strokeWidth={1.3} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] max-w-sm bg-background">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="mt-16 flex flex-col gap-8">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} data-testid={`mobile-nav-${l.label.toLowerCase()}`} className="font-display text-4xl">
                  {l.label}
                </Link>
              ))}
              <Link to={user ? "/account" : "/login"} data-testid="mobile-nav-account" className="font-display text-4xl">
                Account
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" data-testid="brand-logo" className="flex items-center gap-3">
          <KnightMark className="h-9 w-9 text-gold" />
          <Wordmark className="hidden sm:flex" />
        </Link>

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          {user?.role === "admin" && (
            <Link to="/admin" data-testid="nav-admin" className="hidden items-center gap-2 px-3 text-[0.7rem] uppercase tracking-[0.3em] text-gold sm:flex">
              <Crown className="h-4 w-4" strokeWidth={1.3} /> Admin
            </Link>
          )}
          <IconBtn onClick={toggle} data-testid="theme-toggle" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.3} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.3} />}
          </IconBtn>
          <Link to={user ? "/account" : "/login"} data-testid="nav-account" className="hidden h-10 w-10 place-items-center hover:text-gold sm:grid">
            <User className="h-[18px] w-[18px]" strokeWidth={1.3} />
          </Link>
          <IconBtn onClick={() => setOpen(true)} data-testid="cart-open-btn" aria-label="Open bag">
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.3} />
            {count > 0 && (
              <span data-testid="cart-count" className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.6rem] text-background">
                {count}
              </span>
            )}
          </IconBtn>
        </div>
      </div>
    </header>
  );
}
