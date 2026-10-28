import { useState, useEffect } from "react";
import { cutout } from "@/lib/visual";

/** Transparent bottle render with graceful fallback to the staged photo. */
export function Bottle({ p, className = "", style, ...rest }) {
  const [src, setSrc] = useState(() => cutout(p) || p?.image);

  useEffect(() => {
    setSrc(cutout(p) || p?.image);
  }, [p]);

  return (
    <img
      src={src}
      alt={p?.name || "Perfume bottle"}
      draggable={false}
      onError={() => {
        const fallback = p?.image || cutout(p);
        if (src !== fallback) setSrc(fallback);
      }}
      className={`select-none object-contain ${className}`}
      style={style}
      {...rest}
    />
  );
}
