export const KnightMark = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
    <path d="M32 3 L55 11 V30 C55 45 45 55 32 61 C19 55 9 45 9 30 V11 Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path
      fillRule="evenodd"
      fill="currentColor"
      d="M21.5 46 V31 C21.5 23.5 26 18.5 32 18.5 C38 18.5 42.5 23.5 42.5 31 V46 Z M24.5 29.4 H39.5 V31.6 H24.5 Z M31 33.5 H33 V43.5 H31 Z M27 35 H28.6 V42 H27 Z M35.4 35 H37 V42 H35.4 Z"
    />
    <path d="M32 18.5 C31.5 12.5 35.5 9 41.5 8.5 C38 11 37 14 37.5 19.6" fill="currentColor" />
  </svg>
);

export const Wordmark = ({ className = "" }) => (
  <span className={`font-display text-lg leading-none tracking-tight ${className}`}>
    House of the Knight
  </span>
);
