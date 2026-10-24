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
    if (hash && hash.length > 1 && !hash.includes("session_id")) {
      const scroll = () => {
        const el = document.querySelector(hash);
        if (el) {
          if (l) l.scrollTo(el, { offset: -80, duration: 0.85 });
          else el.scrollIntoView({ behavior: "smooth" });
        }
      };
      scroll();
      const t1 = setTimeout(scroll, 180);
      const t2 = setTimeout(scroll, 550);
      const t3 = setTimeout(scroll, 1100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
    if (l) l.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return null;
}
