export const KnightMark = ({ className = "h-8 w-8", alt = "House of the Knight" }) => (
  <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
    <img
      src="/images/hok-monogram.png"
      alt={alt}
      className="h-full w-full object-contain pointer-events-none select-none transition-transform duration-300"
      loading="eager"
      decoding="async"
    />
  </span>
);

export const Wordmark = ({ className = "" }) => (
  <span className={`font-display text-lg leading-none tracking-tight ${className}`}>
    House of the Knight
  </span>
);

export const FullLogo = ({ className = "h-16 w-auto", alt = "House of the Knight" }) => (
  <img
    src="/images/hok-logo.png"
    alt={alt}
    className={`inline-block object-contain pointer-events-none select-none ${className}`}
    loading="eager"
    decoding="async"
  />
);

