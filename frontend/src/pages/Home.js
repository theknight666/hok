import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "./home/Hero";
import { Collection } from "./home/Collection";
import { CollectionPreview } from "./home/CollectionPreview";
import { Armoury } from "./home/Armoury";
import { Atelier } from "./home/Atelier";
import { Manifesto } from "./home/Manifesto";
import { Quotes } from "./home/Quotes";
import { Credentials } from "@/components/site/Credentials";
import { Intro } from "@/components/site/Intro";
import { useProducts } from "@/hooks/useProducts";

export default function Home() {
  const { products, isError } = useProducts();
  const featured = products.filter((p) => p.featured);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      const el = document.getElementById(targetId);
      if (el) {
        const timer = setTimeout(() => {
          if (window.__lenis) {
            window.__lenis.resize();
            window.__lenis.scrollTo(el, { offset: -85, duration: 0.85, force: true });
          } else {
            const top = el.getBoundingClientRect().top + window.scrollY - 85;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }, 120);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      }
    }
  }, [location.state]);
  return (
    <main data-testid="home-page">
      <Intro />
      <Hero products={products} />
      <Manifesto />
      {isError && <p className="px-10 py-20 text-center text-muted-foreground">The collection is momentarily unavailable.</p>}
      <Collection products={featured} />
      <CollectionPreview products={products} />
      <Credentials />
      <Armoury products={products} />
      <Atelier />
      <Quotes />
    </main>
  );
}
