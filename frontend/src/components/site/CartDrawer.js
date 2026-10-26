import { Link } from "react-router-dom";
import { Minus, Plus, X, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { Bottle } from "./Bottle";
import { worldOf } from "@/lib/visual";
import { inr, FREE_SHIPPING } from "@/lib/api";

export function CartDrawer() {
  const { items, open, setOpen, update, remove, clear, subtotal } = useCart();
  const left = Math.max(0, FREE_SHIPPING - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col bg-background p-0 sm:max-w-md" data-testid="cart-drawer">
        <div className="border-b px-7 pb-6 pt-8">
          <p className="eyebrow">Your Bag</p>
          <SheetTitle className="mt-2 font-display text-3xl">{items.length ? "Selected for you" : "Your bag is empty"}</SheetTitle>
          <SheetDescription className="sr-only">Review the fragrances in your bag, adjust quantities, and proceed to checkout.</SheetDescription>
          {items.length > 0 && (
            <div className="mt-5">
              <p className="text-xs tracking-wide text-muted-foreground" data-testid="cart-shipping-note">
                {left > 0 ? `${inr(left)} away from complimentary shipping` : "Complimentary shipping unlocked"}
              </p>
              <div className="mt-2 h-px w-full bg-border">
                <div className="h-px bg-gold transition-[width] duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-7" data-lenis-prevent>
          {items.map((i) => {
            const itemKey = i.key || `${i.slug}-${i.size || "50 ml"}`;
            return (
              <div key={itemKey} className="flex gap-5 border-b py-6" data-testid={`cart-item-${itemKey}`}>
                <div className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl" style={{ background: worldOf(i).bg }}>
                  <Bottle p={i} className="h-24 w-auto" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-display text-xl leading-tight">{i.name}</p>
                      <span className="mt-1 inline-block text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                        {i.size || "50 ml"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(itemKey);
                      }}
                      data-testid={`cart-remove-${itemKey}`}
                      className="-mr-2 -mt-2 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all touch-manipulation cursor-pointer"
                      aria-label={`Remove ${i.name} from bag`}
                    >
                      <X className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{inr(i.price)}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="inline-flex items-center rounded-full border border-border/80 bg-muted/40 p-0.5">
                      <button
                        type="button"
                        onClick={() => update(itemKey, i.qty - 1)}
                        data-testid={`cart-dec-${itemKey}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-background hover:text-gold active:scale-90 transition-all touch-manipulation text-muted-foreground hover:text-foreground"
                        aria-label={i.qty === 1 ? "Remove item" : "Decrease quantity"}
                      >
                        {i.qty === 1 ? (
                          <Trash2 className="h-3.5 w-3.5 text-red-500/80 hover:text-red-500" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <span className="min-w-[28px] text-center text-xs font-semibold" data-testid={`cart-qty-${itemKey}`}>
                        {i.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => update(itemKey, i.qty + 1)}
                        data-testid={`cart-inc-${itemKey}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-background hover:text-gold active:scale-90 transition-all touch-manipulation text-muted-foreground hover:text-foreground"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(itemKey)}
                      className="text-[11px] font-medium text-muted-foreground hover:text-red-500 active:text-red-600 transition-colors underline-offset-4 hover:underline p-1 touch-manipulation"
                      aria-label="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {items.length > 1 && (
            <div className="py-3 text-right">
              <button
                type="button"
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-red-500 active:text-red-600 transition-colors"
                data-testid="cart-clear-btn"
              >
                Clear entire bag
              </button>
            </div>
          )}
          {!items.length && (
            <div className="py-16">
              <p className="text-muted-foreground">Discover the four signatures of the House.</p>
              <Link to="/#collection" onClick={() => setOpen(false)} className="btn-ghost-royal mt-8" data-testid="cart-explore-btn">Explore the collection</Link>
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t px-7 py-7">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Subtotal</span>
              <span className="font-display text-2xl" data-testid="cart-subtotal">{inr(subtotal)}</span>
            </div>
            <Link to="/checkout" onClick={() => setOpen(false)} className="btn-royal mt-6 w-full" data-testid="cart-checkout-btn">
              <span>Proceed to checkout</span>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
