import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);
const KEY = "hotk_cart";

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
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

  const add = (p, qty = 1, size = "50 ml") => {
    const unitPrice = size === "2 ml" ? (p.sample_price || 99) : p.price;
    const key = `${p.slug}-${size}`;
    setItems((cur) => {
      const ex = cur.find((i) => (i.key || `${i.slug}-${i.size || "50 ml"}`) === key);
      const max = size === "2 ml" ? 20 : (p.stock ?? 20);
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
  };
  const update = (keyOrSlug, qty) =>
    setItems((cur) =>
      cur.map((i) =>
        (i.key === keyOrSlug || i.slug === keyOrSlug)
          ? { ...i, qty: Math.max(1, Math.min(i.stock ?? 20, qty)) }
          : i
      )
    );
  const remove = (keyOrSlug) =>
    setItems((cur) => cur.filter((i) => i.key !== keyOrSlug && i.slug !== keyOrSlug));
  const clear = () => setItems([]);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    return { items, open, setOpen, add, update, remove, clear, count, subtotal };
  }, [items, open]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
