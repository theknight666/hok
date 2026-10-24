import { Fragment, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Truck, ExternalLink, Save, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, formatErr, inr } from "@/lib/api";
import { StatusPill } from "../Account";

const STATUSES = ["pending", "processing", "dispatched", "delivered", "cancelled"];
const COURIER_PRESETS = ["Delhivery", "BlueDart", "DTDC", "India Post", "Shiprocket"];

function OrderFulfillment({ order, onSave }) {
  const [courier, setCourier] = useState(order.courier || "Delhivery");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [status, setStatus] = useState(order.status || "processing");
  const [estimatedDelivery, setEstimatedDelivery] = useState(order.estimated_delivery || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(order.order_id, {
        status,
        courier,
        tracking_number: trackingNumber,
        estimated_delivery: estimatedDelivery
      });
      toast.success(`Fulfillment updated for ${order.order_id}`);
    } catch (err) {
      toast.error(formatErr(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-gold/30 bg-background/80 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-gold" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Shipping & Tracking Fulfillment
          </p>
        </div>
        <a
          href={`/track?order_id=${order.order_id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
        >
          <span>Preview customer tracking</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
        {/* Status */}
        <div className="sm:col-span-3">
          <label className="block text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
            Order Status
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 rounded-xl border border-border/60 bg-card text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Courier */}
        <div className="sm:col-span-3">
          <label className="block text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
            Courier Partner
          </label>
          <input
            type="text"
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            placeholder="e.g. Delhivery / BlueDart"
            className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {COURIER_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCourier(c)}
                className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                  courier === c ? "border-gold text-gold font-bold" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tracking Number / AWB */}
        <div className="sm:col-span-3">
          <label className="block text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
            AWB / Tracking ID
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. 12894019283"
            className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
          />
        </div>

        {/* Estimated Arrival */}
        <div className="sm:col-span-3">
          <label className="block text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
            Estimated Delivery
          </label>
          <input
            type="text"
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
            placeholder="e.g. 2–3 Days or 28 Oct"
            className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none"
          />
        </div>

        {/* Submit */}
        <div className="sm:col-span-12 flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-royal !py-2 !px-5 text-xs shadow-md inline-flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Saving..." : "Save Tracking & Update Status"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function Orders() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-orders"], queryFn: async () => (await api.get("/admin/orders")).data });
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState("all");
  const orders = (Array.isArray(data) ? data : []).filter((o) => filter === "all" || o.status === filter);

  const updateOrderFulfillment = async (id, payload) => {
    await api.patch(`/admin/orders/${id}`, payload);
    ["admin-orders", "admin-stats", "admin-products"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  };

  const setStatus = async (id, status) => {
    try {
      await updateOrderFulfillment(id, { status });
      toast.success(`Order ${id} → ${status}`);
    } catch (e) {
      toast.error(formatErr(e));
    }
  };

  return (
    <div data-testid="admin-orders">
      <div className="mb-6 flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} data-testid={`order-filter-${s}`} className={`border px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] transition-colors ${filter === s ? "border-gold text-gold" : "hover:border-foreground/50"}`}>{s}</button>
        ))}
      </div>
      {!orders.length && <p className="text-muted-foreground">No orders here yet.</p>}
      <div className="overflow-x-auto" data-lenis-prevent>
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b text-left text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">
              <th className="pb-3">Order</th><th className="pb-3">Customer</th><th className="pb-3">Date</th><th className="pb-3">Total</th><th className="pb-3">Payment</th><th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <Fragment key={o.order_id}>
                <tr className="cursor-pointer border-b hover:bg-card" onClick={() => setOpen(open === o.order_id ? null : o.order_id)} data-testid={`order-row-${o.order_id}`}>
                  <td className="py-4 font-display text-lg">
                    {o.order_id}
                    {o.tracking_number && (
                      <span className="block text-[10px] font-mono text-gold truncate max-w-[140px]">
                        AWB: {o.tracking_number}
                      </span>
                    )}
                  </td>
                  <td>{o.address?.full_name || o.address?.name || "Customer"}<p className="text-xs text-muted-foreground">{o.email}</p></td>
                  <td className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  <td>{inr(o.total)}</td>
                  <td className="text-xs" data-testid={`order-payment-${o.order_id}`}><span className={o.payment_status === "paid" ? "text-emerald-700 dark:text-emerald-400" : o.payment_status === "failed" ? "text-destructive" : "text-muted-foreground"}>{o.payment_status === "paid" ? "Paid" : o.payment_status === "failed" ? "Failed" : "Awaiting"}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Select value={o.status} onValueChange={(v) => setStatus(o.order_id, v)}>
                      <SelectTrigger className="h-9 w-40 rounded-none" data-testid={`order-status-${o.order_id}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                </tr>
                {open === o.order_id && (
                  <tr className="border-b bg-card">
                    <td colSpan={6} className="p-6">
                      <div className="grid gap-6 sm:grid-cols-3">
                        <div>
                          <p className="eyebrow">Items</p>
                          {o.items?.map((i, idx) => (
                            <p key={idx} className="mt-2 text-xs sm:text-sm">
                              {i.name} ({i.size || "50 ml"}) × {i.qty} — {inr(i.line_total || (i.price * i.qty))}
                            </p>
                          ))}
                          <p className="mt-2 text-xs text-muted-foreground">Shipping: {o.shipping ? inr(o.shipping) : "Free"}</p>
                        </div>
                        <div>
                          <p className="eyebrow">Deliver to</p>
                          <p className="mt-2 text-xs sm:text-sm font-medium">{o.address?.full_name || o.address?.name} · {o.address?.phone}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {[o.address?.line1 || o.address?.street, o.address?.line2, o.address?.city, o.address?.state, o.address?.pincode].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <div>
                          <p className="eyebrow">Gift note</p>
                          <p className="mt-2 text-xs text-muted-foreground italic">{o.gift_note || "None"}</p>
                          <div className="mt-3"><StatusPill s={o.status} /></div>
                        </div>
                      </div>

                      {/* Fulfillment & Tracking Control */}
                      <OrderFulfillment order={o} onSave={updateOrderFulfillment} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
