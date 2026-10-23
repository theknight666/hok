import { Hero } from "./home/Hero";
import { Collection } from "./home/Collection";
import { Atelier } from "./home/Atelier";
import { NotesAtlas } from "./home/NotesAtlas";
import { Manifesto } from "./home/Manifesto";
import { Marquee } from "@/components/site/Marquee";
import { Intro } from "@/components/site/Intro";
import { useProducts } from "@/hooks/useProducts";

export default function Home() {
  const { products, isError } = useProducts();
  return (
    <main data-testid="home-page">
      <Intro />
      <Hero products={products} />
      <Marquee />
      {isError && <p className="px-10 py-20 text-center text-muted-foreground">The collection is momentarily unavailable.</p>}
      <Collection products={products} />
      <Atelier />
      <NotesAtlas products={products} />
      <Manifesto />
    </main>
  );
}
