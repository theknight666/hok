import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { Bottle } from "./Bottle";
import { worldOf } from "@/lib/visual";
import { inr, FREE_SHIPPING } from "@/lib/api";

export function CartDrawer() {
  const { items, open, setOpen, update, remove, subtotal } = useCart();
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
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-display text-xl leading-tight">{i.name}</p>
                      <span className="mt-1 inline-block text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                        {i.size || "50 ml"}
                      </span>
                    </div>
                    <button onClick={() => remove(itemKey)} data-testid={`cart-remove-${itemKey}`} className="text-muted-foreground hover:text-foreground" aria-label="Remove">
                      <X className="h-4 w-4" strokeWidth={1.3} />
                    </button>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{inr(i.price)}</p>
                  <div className="mt-auto flex items-center gap-4">
                    <button onClick={() => update(itemKey, i.qty - 1)} data-testid={`cart-dec-${itemKey}`} className="hover:text-gold" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-5 text-center text-sm" data-testid={`cart-qty-${itemKey}`}>{i.qty}</span>
                    <button onClick={() => update(itemKey, i.qty + 1)} data-testid={`cart-inc-${itemKey}`} className="hover:text-gold" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
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
