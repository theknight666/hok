import { Link } from "react-router-dom";
import { ScrollWords, FadeUp } from "@/components/site/Reveal";

export function Manifesto() {
  return (
    <section className="relative mx-auto max-w-[1600px] px-5 py-32 sm:px-10 lg:py-48" data-testid="manifesto-section">
      <p className="eyebrow">The House</p>
      <ScrollWords
        text="Our perfumes use real, serious ingredients like it's the 1400s. Resins, woods, spirits and spice — things with weight, not a chemistry set with a French name."
        className="display-md mt-6 max-w-[22ch] font-display"
      />
      <ScrollWords
        text="Spray it on before you walk in and act surprised when the room turns around."
        className="display-md mt-16 max-w-[20ch] font-display-italic text-gold lg:ml-[20%]"
      />
      <FadeUp className="mt-16 flex flex-wrap gap-4 lg:ml-[20%]">
        <Link to="/collection" className="btn-royal" data-testid="manifesto-cta">Find your signature</Link>
        <Link to="/#armoury" className="btn-ghost-royal" data-testid="manifesto-armoury-cta">
          <span>Build an armoury</span>
        </Link>
      </FadeUp>
    </section>
  );
}
