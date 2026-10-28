import { useState, useEffect } from "react";
import { cutout, defaultCutoutOf, isValidImageUrl } from "@/lib/visual";

/**
 * Responsive bottle render that always respects the primary image chosen in admin,
 * with graceful fallback to transparent cutouts when using default catalog assets
 * or if a custom image fails to load.
 */
function resolveBottleSrc(p) {
  if (!p) return "/images/cut-blonde-amber.png";
  if (isValidImageUrl(p.image)) {
    return p.image;
  }
  return cutout(p) || defaultCutoutOf(p?.slug);
}

export function Bottle({ p, className = "", style, ...rest }) {
  const [src, setSrc] = useState(() => resolveBottleSrc(p));

  useEffect(() => {
    setSrc(resolveBottleSrc(p));
  }, [p, p?.image, p?.slug]);

  const handleImgError = () => {
    const defaultCut = defaultCutoutOf(p?.slug);
    if (src !== defaultCut) {
      setSrc(defaultCut);
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
