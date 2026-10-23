import { useState } from "react";
import { cutout } from "@/lib/visual";

/** Transparent bottle render with graceful fallback to the staged photo. */
export function Bottle({ p, className = "", style, ...rest }) {
  const [src, setSrc] = useState(() => cutout(p) || p?.image);
  return (
    <img
      src={src}
      alt={p?.name || "Perfume bottle"}
      draggable={false}
      onError={() => src !== p?.image && setSrc(p?.image)}
      className={`select-none object-contain ${className}`}
      style={style}
      {...rest}
    />
  );
}
