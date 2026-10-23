import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api, formatErr, inr, FREE_SHIPPING, SHIPPING_FEE } from "@/lib/api";

const FIELDS = [
  ["full_name", "Full name", "sm:col-span-2"],
  ["phone", "Phone", ""],
  ["pincode", "PIN code", ""],
  ["line1", "Address line 1", "sm:col-span-2"],
  ["line2", "Address line 2 (optional)", "sm:col-span-2"],
  ["city", "City", ""],
  ["state", "State", ""],
];

const inputCls = "w-full border-b border-input bg-transparent py-3 text-base outline-none transition-colors focus:border-gold";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [addr, setAddr] = useState({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [gift, setGift] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  const mail = email || (user && user.email) || "";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/orders", { email: mail, address: addr, gift_note: gift, items: items.map((i) => ({ slug: i.slug, qty: i.qty })) });
      setOrder(data);
      clear();
    } catch (err) {
      toast.error(formatErr(err));
    } finally {
      setBusy(false);
    }
  };

  if (order)
    return (
      <main className="mx-auto grid min-h-screen max-w-2xl place-items-center px-6 pt-[72px] text-center" data-testid="order-confirmation">
        <div>
          <CheckCircle2 className="mx-auto h-12 w-12 text-gold" strokeWidth={1} />
          <p className="eyebrow mt-8">Order reserved</p>
          <h1 className="mt-4 font-display text-5xl font-light sm:text-6xl">Thank you, {order.address.full_name.split(" ")[0]}.</h1>
          <p className="mt-6 text-muted-foreground">Order <span className="text-foreground" data-testid="order-id">{order.order_id}</span> · {inr(order.total)}</p>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">Online payment is not connected yet — your order is reserved and the House will contact you at {order.email} to complete payment.</p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/" className="btn-ghost-royal">Return home</Link>
            {user && <Link to="/account" className="btn-royal" data-testid="view-orders-btn"><span>View my orders</span></Link>}
          </div>
        </div>
      </main>
    );

  return (
    <main className="mx-auto max-w-[1300px] px-5 pb-24 pt-[120px] sm:px-10" data-testid="checkout-page">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-4 font-display text-5xl font-light sm:text-6xl">Seal your order.</h1>
      {!items.length ? (
        <div className="mt-12">
          <p className="text-muted-foreground">Your bag is empty.</p>
          <Link to="/#collection" className="btn-ghost-royal mt-8">Explore the collection</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-14 grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-display text-2xl">Contact</p>
            <input required type="email" placeholder="Email" value={mail} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} mt-4`} data-testid="checkout-email" />
            {!user && <p className="mt-3 text-sm text-muted-foreground">Have an account? <Link to="/login" className="text-gold link-line">Sign in</Link> to track this order.</p>}
            <p className="mt-12 font-display text-2xl">Delivery</p>
            <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {FIELDS.map(([k, label, span]) => (
                <input key={k} required={k !== "line2"} placeholder={label} value={addr[k]} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} className={`${inputCls} ${span}`} data-testid={`checkout-${k}`} />
              ))}
            </div>
            <p className="mt-12 font-display text-2xl">Gift note</p>
            <textarea rows={3} placeholder="An optional message, hand-written on the card" value={gift} onChange={(e) => setGift(e.target.value)} className={`${inputCls} mt-4 resize-none`} data-testid="checkout-gift" />
          </div>
          <aside className="lg:col-span-5">
            <div className="border bg-card p-8 lg:sticky lg:top-28">
              <p className="eyebrow">Summary</p>
              {items.map((i) => (
                <div key={i.slug} className="flex items-center gap-4 border-b py-5">
                  <img src={i.image} alt={i.name} className="h-16 w-12 object-cover" />
                  <span className="flex-1 font-display text-lg">{i.name} <span className="text-sm text-muted-foreground">× {i.qty}</span></span>
                  <span className="text-sm">{inr(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping ? inr(shipping) : "Complimentary"}</span></div>
              </div>
              <div className="mt-5 flex items-baseline justify-between border-t pt-5">
                <span className="text-xs uppercase tracking-[0.3em]">Total</span>
                <span className="font-display text-3xl" data-testid="checkout-total">{inr(subtotal + shipping)}</span>
              </div>
              <button disabled={busy} className="btn-royal mt-8 w-full disabled:opacity-60" data-testid="place-order-btn">
                <span>{busy ? "Reserving…" : "Place order"}</span>
              </button>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Online payment is coming soon. Your order will be reserved and payment completed on confirmation.</p>
            </div>
          </aside>
        </form>
      )}
    </main>
  );
}
