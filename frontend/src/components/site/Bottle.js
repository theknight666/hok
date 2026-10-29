import { useState, useEffect } from "react";
import { cutout, defaultCutoutOf, isValidImageUrl } from "@/lib/visual";

/**
 * Responsive bottle render that always respects the primary image chosen in admin,
 * with graceful fallback to transparent cutouts when using default catalog assets
 * or if a custom image fails to load.
 */
function resolveBottleSrc(p) {
  if (!p) return "";
  if (p.image && (p.image.endsWith("/blonde-amber.jpg") || p.image.endsWith("/layton.jpg") || p.image.endsWith("/angels-share.jpg") || p.image.endsWith("/side-effect.jpg"))) {
    return defaultCutoutOf(p.slug);
  }
  if (isValidImageUrl(p.image)) {
    return p.image;
  }
  return cutout(p) || defaultCutoutOf(p?.slug) || "";
}

export function Bottle({ p, className = "", style, ...rest }) {
  const [src, setSrc] = useState(() => resolveBottleSrc(p));

  useEffect(() => {
    setSrc(resolveBottleSrc(p));
  }, [p, p?.image, p?.slug]);

  if (!src) {
    return (
      <div
        className={`grid place-items-center rounded-2xl bg-muted/20 border border-border/40 select-none ${className}`}
        style={style}
      >
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground/50">No Image</span>
      </div>
    );
  }

  const handleImgError = (e) => {
    if (e?.currentTarget) {
      e.currentTarget.onerror = null;
      e.currentTarget.style.display = "none";
    }
  };

  return (
    <img
      src={src}
      alt={p?.name || "Perfume bottle"}
      draggable={false}
      onError={handleImgError}
      className={`select-none object-contain ${className}`}
      style={style}
      {...rest}
    />
  );
}
