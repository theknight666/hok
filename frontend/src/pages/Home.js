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
  const featured = products.filter((p) => p.featured).slice(0, 4);
  return (
    <main data-testid="home-page">
      <Intro />
      <Hero products={products} />
      <Credentials />
      <Manifesto />
      {isError && <p className="px-10 py-20 text-center text-muted-foreground">The collection is momentarily unavailable.</p>}
      <Collection products={featured} />
      <CollectionPreview products={products} />
      <Armoury products={products} />
      <Atelier />
      <Quotes />
    </main>
  );
}
