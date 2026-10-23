import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

export function SmoothScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    window.__lenis = lenis;
    let id;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    const l = window.__lenis;
    if (hash && hash.length > 1 && !hash.includes("session_id")) {
      const t = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) (l ? l.scrollTo(el, { offset: -60 }) : el.scrollIntoView());
      }, 120);
      return () => clearTimeout(t);
    }
    if (l) l.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return null;
}
