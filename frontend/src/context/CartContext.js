import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getCachedCatalog, setCachedCatalog } from "@/hooks/useProducts";

const CartCtx = createContext(null);
const KEY = "hotk_cart";

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(v)) return [];
    // Migrate & normalize legacy cart items
    return v.map((item) => ({
      ...item,
      size: item.size || "50 ml",
      key: item.key || `${item.slug}-${item.size || "50 ml"}`,
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  // Synchronize cart with current live product prices and availability
  const syncWithCatalog = useCallback((catalog) => {
    if (!Array.isArray(catalog) || catalog.length === 0) return;

    const priceChanges = [];
    const removedItems = [];

    setItems((curItems) => {
      if (!curItems || curItems.length === 0) return curItems;

      let changed = false;
      const nextItems = [];

      for (const item of curItems) {
        const prod = catalog.find((p) => p.slug === item.slug);

        // If product was completely removed or inactive
        if (!prod || prod.active === false) {
          removedItems.push(item.name || item.slug);
          changed = true;
          continue;
        }

        const size = item.size || "50 ml";
        const currentPrice = size === "2 ml" ? (prod.sample_price || 99) : prod.price;
        const maxStock = size === "2 ml" ? (prod.sample_stock !== undefined ? prod.sample_stock : 50) : (prod.stock ?? 20);

        // Detect price change
        if (item.price !== currentPrice) {
          priceChanges.push({
            name: prod.name,
            size,
            oldPrice: item.price,
            newPrice: currentPrice,
          });
          changed = true;
        }

        nextItems.push({
          ...item,
          name: prod.name,
          image: prod.image || item.image,
          color: prod.color || item.color,
          size,
          key: item.key || `${item.slug}-${size}`,
          price: currentPrice,
          stock: maxStock,
          qty: Math.min(maxStock, item.qty),
        });
      }

      if (!changed) return curItems;
      return nextItems;
    });

    // Notify user if any price changed
    if (priceChanges.length > 0) {
      priceChanges.forEach((c) => {
        toast.info(
          `Price updated for ${c.name} (${c.size}): ₹${Number(c.oldPrice || 0).toLocaleString("en-IN")} → ₹${Number(c.newPrice || 0).toLocaleString("en-IN")}`,
          { duration: 7000, id: `price-change-${c.name}-${c.size}` }
        );
      });
    }

    if (removedItems.length > 0) {
      toast.warning(
        `${removedItems.join(", ")} is no longer available and was removed from your bag.`,
        { duration: 7000 }
      );
    }
  }, []);

  // Sync on mount and window focus
  useEffect(() => {
    // 1. Immediate sync against local cached catalog
    const localCatalog = getCachedCatalog();
    if (localCatalog && localCatalog.length > 0) {
      syncWithCatalog(localCatalog);
    }

    // 2. Fetch fresh catalog from API
    api.get("/products")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCachedCatalog(res.data);
          syncWithCatalog(res.data);
        }
      })
      .catch(() => {
        // Fallback already synced
      });

    const handleFocus = () => {
      const freshCatalog = getCachedCatalog();
      if (freshCatalog && freshCatalog.length > 0) {
        syncWithCatalog(freshCatalog);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [syncWithCatalog]);

  const add = useCallback((p, qty = 1, size = "50 ml") => {
    const unitPrice = size === "2 ml" ? (p.sample_price || 99) : p.price;
    const key = `${p.slug}-${size}`;
    setItems((cur) => {
      const ex = cur.find((i) => (i.key || `${i.slug}-${i.size || "50 ml"}`) === key);
      const max = size === "2 ml" ? (p.sample_stock !== undefined ? p.sample_stock : 50) : (p.stock ?? 20);
      if (ex) {
        return cur.map((i) =>
          (i.key || `${i.slug}-${i.size || "50 ml"}`) === key
            ? { ...i, qty: Math.min(max, i.qty + qty) }
            : i
        );
      }
      return [
        ...cur,
        {
          key,
          slug: p.slug,
          name: p.name,
          size,
          price: unitPrice,
          image: p.image,
          color: p.color,
          stock: max,
          qty,
        },
      ];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((keyOrSlug) => {
    setItems((cur) =>
      cur.filter((i) => {
        const itemKey = i.key || `${i.slug}-${i.size || "50 ml"}`;
        return itemKey !== keyOrSlug && i.slug !== keyOrSlug && i.key !== keyOrSlug;
      })
    );
  }, []);

  const update = useCallback((keyOrSlug, qty) => {
    if (qty <= 0) {
      remove(keyOrSlug);
      return;
    }
    setItems((cur) =>
      cur.map((i) => {
        const itemKey = i.key || `${i.slug}-${i.size || "50 ml"}`;
        if (itemKey === keyOrSlug || i.slug === keyOrSlug || i.key === keyOrSlug) {
          return { ...i, qty: Math.min(i.stock ?? 20, qty) };
        }
        return i;
      })
    );
  }, [remove]);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    return { items, open, setOpen, add, update, remove, clear, count, subtotal };
  }, [items, open, add, update, remove, clear]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
