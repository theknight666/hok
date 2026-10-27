import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api, formatErr, inr, FREE_SHIPPING, SHIPPING_FEE } from "@/lib/api";
import { Bottle } from "@/components/site/Bottle";
import { worldOf } from "@/lib/visual";

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

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((res) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.body.appendChild(s);
  });
}

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
  const { data: payCfg } = useQuery({ queryKey: ["pay-config"], queryFn: async () => (await api.get("/payments/config")).data });
  const payOn = !!payCfg?.enabled;
  const placedId = order?.order_id;

  useEffect(() => {
    if (!placedId) return;
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [placedId]);

  const pay = async (o) => {
    if (!o?.razorpay) return;
    if (!(await loadRazorpay())) {
      toast.error("Could not load the payment window. Check your connection and try again.");
      return;
    }
    const rzp = new window.Razorpay({
      key: o.razorpay.key_id,
      amount: o.razorpay.amount,
      currency: o.razorpay.currency,
      order_id: o.razorpay.order_id,
      name: "House Of The Knight",
      description: `Order ${o.order_id}`,
      prefill: { name: o.address.full_name, email: o.email, contact: o.address.phone },
      theme: { color: "#8E6B26" },
      handler: async (r) => {
        try {
          const { data } = await api.post("/payments/verify", { order_id: o.order_id, ...r });
          setOrder(data);
          toast.success("Payment received");
        } catch (err) {
          toast.error(formatErr(err));
        }
      },
      modal: { ondismiss: () => toast("Payment not completed. You can try again below.") },
    });
    rzp.on("payment.failed", () => toast.error("Payment failed. Please try again."));
    rzp.open();
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/orders", { email: mail, address: addr, gift_note: gift, items: items.map((i) => ({ slug: i.slug, qty: i.qty, size: i.size || "50 ml" })) });
      setOrder(data);
      clear();
      pay(data);
    } catch (err) {
      toast.error(formatErr(err));
    } finally {
      setBusy(false);
    }
  };

  if (order) {
    const paid = order.payment_status === "paid";
    return (
      <main className="mx-auto grid min-h-screen max-w-2xl place-items-center px-6 pt-[72px] text-center" data-testid="order-confirmation">
        <div>
          <CheckCircle2 className="mx-auto h-12 w-12 text-gold" strokeWidth={1} />
          <p className="eyebrow mt-8" data-testid="payment-status">{paid ? "Payment received" : "Order reserved · payment pending"}</p>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">Thank you, {order.address.full_name.split(" ")[0]}.</h1>
          <p className="mt-6 text-muted-foreground">Order <span className="text-foreground" data-testid="order-id">{order.order_id}</span> · {inr(order.total)}</p>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            {paid
              ? `Your order is confirmed. A note will reach you at ${order.email} once it is dispatched.`
              : order.razorpay
                ? "Your order is reserved. Complete the payment to confirm it."
                : `Online payment is not connected yet — your order is reserved and the House will contact you at ${order.email} to complete payment.`}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {!paid && order.razorpay && (
              <button onClick={() => pay(order)} className="btn-royal" data-testid="pay-now-btn"><span>Pay {inr(order.total)} now</span></button>
            )}
            <Link to={`/track?order_id=${order.order_id}`} className="btn-royal" data-testid="track-order-btn"><span>Track order status</span></Link>
            <Link to="/" className="btn-ghost-royal">Return home</Link>
            {user && <Link to="/account" className="btn-ghost-royal" data-testid="view-orders-btn">View my orders</Link>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1300px] px-5 pb-24 pt-[120px] sm:px-10" data-testid="checkout-page">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-4 font-display text-4xl sm:text-6xl">Seal your order.</h1>
      {!items.length ? (
        <div className="mt-12">
          <p className="text-muted-foreground">Your bag is empty.</p>
          <Link to="/#collection" className="btn-ghost-royal mt-8">Explore the collection</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 sm:mt-14 grid gap-10 lg:gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-display text-2xl">Contact</p>
            <input required type="email" placeholder="Email" value={mail} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} mt-4`} data-testid="checkout-email" />
            {!user && <p className="mt-3 text-sm text-muted-foreground">Have an account? <Link to="/login" className="text-gold link-line">Sign in</Link> to track this order.</p>}
            <p className="mt-10 sm:mt-12 font-display text-2xl">Delivery</p>
            <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {FIELDS.map(([k, label, span]) => (
                <input key={k} required={k !== "line2"} placeholder={label} value={addr[k]} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} className={`${inputCls} ${span}`} data-testid={`checkout-${k}`} />
              ))}
            </div>
            <p className="mt-10 sm:mt-12 font-display text-2xl">Gift note</p>
            <textarea rows={3} placeholder="An optional message, hand-written on the card" value={gift} onChange={(e) => setGift(e.target.value)} className={`${inputCls} mt-4 resize-none`} data-testid="checkout-gift" />
          </div>
          <aside className="lg:col-span-5">
            <div className="rounded-[1.75rem] sm:rounded-[2rem] bg-card p-5 sm:p-8 shadow-xl lg:sticky lg:top-28">
              <p className="eyebrow">Summary</p>
              {items.map((i) => {
                const itemKey = i.key || `${i.slug}-${i.size || "50 ml"}`;
                return (
                  <div key={itemKey} className="flex items-center gap-4 border-b py-5">
                    <div className="flex h-16 w-12 items-center justify-center rounded-xl" style={{ background: worldOf(i).bg }}><Bottle p={i} className="h-14 w-auto" /></div>
                    <div className="flex-1">
                      <p className="font-display text-lg leading-tight">{i.name}</p>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full inline-block mt-1">
                        {i.size || "50 ml"}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">× {i.qty}</span>
                    </div>
                    <span className="text-sm font-semibold">{inr(i.price * i.qty)}</span>
                  </div>
                );
              })}
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping ? inr(shipping) : "Complimentary"}</span></div>
              </div>
              <div className="mt-5 flex items-baseline justify-between border-t pt-5">
                <span className="text-xs uppercase tracking-[0.3em]">Total</span>
                <span className="font-display text-3xl" data-testid="checkout-total">{inr(subtotal + shipping)}</span>
              </div>
              <button disabled={busy} className="btn-royal mt-8 w-full disabled:opacity-60" data-testid="place-order-btn">
                <span>{busy ? "Reserving…" : payOn ? "Place order & pay" : "Place order"}</span>
              </button>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground" data-testid="payment-note">{payOn ? "Pay securely by card, UPI or net banking via Razorpay." : "Online payment is coming soon. Your order will be reserved and payment completed on confirmation."}</p>
            </div>
          </aside>
        </form>
      )}
    </main>
  );
}
