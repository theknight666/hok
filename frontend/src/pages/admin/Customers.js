import { useQuery } from "@tanstack/react-query";
import { api, inr } from "@/lib/api";

export function Customers() {
  const { data } = useQuery({ queryKey: ["admin-customers"], queryFn: async () => (await api.get("/admin/customers")).data });
  const list = Array.isArray(data) ? data : [];
  return (
    <div className="overflow-x-auto" data-testid="admin-customers">
      {!list.length && <p className="text-muted-foreground">No customers yet.</p>}
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b text-left text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">
            <th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Joined</th><th className="pb-3">Orders</th><th className="pb-3">Spent</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.user_id} className="border-b" data-testid={`customer-row-${c.user_id}`}>
              <td className="py-4 font-display text-lg">{c.name}</td>
              <td>{c.email}</td>
              <td className="text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : "—"}</td>
              <td>{c.orders}</td>
              <td>{inr(c.spent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
