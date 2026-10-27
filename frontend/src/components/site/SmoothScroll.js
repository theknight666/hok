import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

export function SmoothScroll() {
  const { pathname, hash } = useLocation();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Disable native scroll restoration so mobile browsers don't jump down
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

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

    // Guarantee that initial site launch always starts at the Hero at (0, 0)
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    lenis.scrollTo(0, { immediate: true });

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

    // On initial page load/visit, if there is a lingering section hash like #house or #best-sellers,
    // clear it from the address bar so subsequent visits/reloads start cleanly at the top hero.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (currentHash && !currentHash.includes("session_id")) {
        if (typeof window !== "undefined" && window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname || "/");
        }
      }
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      if (l) l.scrollTo(0, { immediate: true });
      return undefined;
    }

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
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
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

