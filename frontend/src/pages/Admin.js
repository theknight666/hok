import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { KnightMark } from "@/components/site/Logo";
import { Overview } from "./admin/Overview";
import { Inventory } from "./admin/Inventory";
import { Orders } from "./admin/Orders";
import { Customers } from "./admin/Customers";
import { Reviews } from "./admin/Reviews";

const TABS = [
  ["overview", "Overview", Overview],
  ["inventory", "Inventory", Inventory],
  ["orders", "Orders", Orders],
  ["customers", "Customers", Customers],
  ["reviews", "Reviews", Reviews],
];

export default function Admin() {
  const { user } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (user === null) {
      const timer = setTimeout(() => {
        setTimedOut(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (timedOut && user === null) {
    return <Navigate to="/login" replace />;
  }

  if (user === null) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center" data-testid="admin-loading">
        <div className="flex flex-col items-center gap-4">
          <KnightMark className="h-12 w-12 animate-pulse text-[hsl(var(--gold))]" />
          <p className="eyebrow tracking-[0.3em] text-muted-foreground animate-pulse">
            Authenticating House Ledger…
          </p>
        </div>
      </main>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin")
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center" data-testid="admin-forbidden">
        <p className="font-display text-3xl">This chamber is reserved for the House.</p>
      </main>
    );

  return (
    <main className="mx-auto min-h-screen max-w-[1500px] px-5 pb-24 pt-[120px] sm:px-10" data-testid="admin-page">
      <div className="flex items-center gap-2.5">
        <KnightMark className="h-4 w-4 -translate-y-[1px]" />
        <p className="eyebrow">The Keep · Admin</p>
      </div>
      <h1 className="mt-3 font-display text-5xl">House ledger</h1>
      <Tabs defaultValue="overview" className="mt-10">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b bg-transparent p-0">
          {TABS.map(([v, label]) => (
            <TabsTrigger
              key={v}
              value={v}
              data-testid={`admin-tab-${v}`}
              className="rounded-none border-b-2 border-transparent px-5 py-3 text-xs uppercase tracking-[0.25em] data-[state=active]:border-[hsl(var(--gold))] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(([v, , C]) => (
          <TabsContent key={v} value={v} className="mt-10">
            <C />
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
