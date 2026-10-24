import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

export function SmoothScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });
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
    const currentHash = hash || (typeof window !== "undefined" ? window.location.hash : "");

    if (currentHash && currentHash.length > 1 && !currentHash.includes("session_id")) {
      const targetId = currentHash.replace("#", "");
      const scroll = () => {
        if (l) l.resize();
        const el = document.getElementById(targetId) || document.querySelector(currentHash);
        if (el) {
          if (l) l.scrollTo(el, { offset: -85, duration: 0.85, force: true });
          else {
            const top = el.getBoundingClientRect().top + window.scrollY - 85;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }
      };

      scroll();
      const t1 = setTimeout(scroll, 150);
      const t2 = setTimeout(scroll, 500);
      const t3 = setTimeout(scroll, 1100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    if (!currentHash) {
      if (l) l.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    }
    return undefined;
  }, [pathname, hash]);

  return null;
}
