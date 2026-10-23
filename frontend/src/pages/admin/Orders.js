import { Fragment, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, formatErr, inr } from "@/lib/api";
import { StatusPill } from "../Account";

const STATUSES = ["pending", "processing", "dispatched", "delivered", "cancelled"];

export function Orders() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-orders"], queryFn: async () => (await api.get("/admin/orders")).data });
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState("all");
  const orders = (Array.isArray(data) ? data : []).filter((o) => filter === "all" || o.status === filter);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}`, { status });
      toast.success(`Order ${id} → ${status}`);
      ["admin-orders", "admin-stats", "admin-products"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
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
                  <td className="py-4 font-display text-lg">{o.order_id}</td>
                  <td>{o.address?.full_name}<p className="text-xs text-muted-foreground">{o.email}</p></td>
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
                          {o.items.map((i) => <p key={i.slug} className="mt-2">{i.name} × {i.qty} — {inr(i.line_total)}</p>)}
                          <p className="mt-2 text-muted-foreground">Shipping {inr(o.shipping)}</p>
                        </div>
                        <div>
                          <p className="eyebrow">Deliver to</p>
                          <p className="mt-2">{o.address.full_name} · {o.address.phone}</p>
                          <p className="text-muted-foreground">{[o.address.line1, o.address.line2, o.address.city, o.address.state, o.address.pincode].filter(Boolean).join(", ")}</p>
                        </div>
                        <div>
                          <p className="eyebrow">Gift note</p>
                          <p className="mt-2 text-muted-foreground">{o.gift_note || "—"}</p>
                          <div className="mt-3"><StatusPill s={o.status} /></div>
                        </div>
                      </div>
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
