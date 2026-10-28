import { useState, useEffect } from "react";
import { cutout } from "@/lib/visual";

/**
 * Responsive bottle render that always respects the primary image chosen in admin,
 * with graceful fallback to transparent cutouts when using default catalog assets.
 */
function resolveBottleSrc(p) {
  if (!p) return "";
  if (p.image && (p.image.startsWith("/api/media/") || p.image.startsWith("data:") || p.image.startsWith("http"))) {
    return p.image;
  }
  return cutout(p) || p.image || "";
}

export function Bottle({ p, className = "", style, ...rest }) {
  const [src, setSrc] = useState(() => resolveBottleSrc(p));

  useEffect(() => {
    setSrc(resolveBottleSrc(p));
  }, [p, p?.image, p?.slug]);

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
