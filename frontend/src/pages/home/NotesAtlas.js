import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Wind, Calendar, Droplet, Layers, ShieldCheck } from "lucide-react";
import { EASE } from "@/components/site/Reveal";
import { getNoteImage } from "@/lib/visual";

function NotePill({ name, color, delay }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = getNoteImage(name);

  return (
    <motion.span
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay, duration: 0.45, ease: EASE }}
      className="group relative inline-flex items-center gap-2.5 rounded-full border-2 bg-background/70 py-1 pl-1 pr-3.5 text-xs sm:text-sm font-semibold backdrop-blur-md transition-all duration-300 hover:scale-[1.04] hover:bg-background hover:shadow-md cursor-default select-none"
      style={{ borderColor: color }}
    >
      <span
        className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/50 bg-muted/60 shadow-inner"
        style={{ borderColor: color ? `${color}55` : undefined }}
      >
        {!imgError && imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-115"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            {name.slice(0, 2)}
          </span>
        )}
      </span>
      <span className="leading-none text-foreground/90 transition-colors group-hover:text-foreground">
        {name}
      </span>
    </motion.span>
  );
}

export function NotesPyramid({ notes, color, product }) {
  const [activeTab, setActiveTab] = useState("pyramid");

  const tiers = [
    {
      label: "Top",
      list: notes?.top || [],
      sub: "The opening · first 15 minutes",
      stage: "0 — 15 Mins",
      desc: "Instant effervescence and volatile aromatics that greet the senses."
    },
    {
      label: "Heart",
      list: notes?.heart || [],
      sub: "The character · first hours",
      stage: "15 Mins — 4 Hours",
      desc: "The true soul of the perfume, unfolding with the natural warmth of the skin."
    },
    {
      label: "Base",
      list: notes?.base || [],
      sub: "The legacy · lasting trail",
      stage: "4 — 12+ Hours",
      desc: "Heavy resins, woods and enduring absolutes that craft an unforgettable signature."
    },
  ];

  const accords = product?.accords || [];
  const architecture = product?.architecture || {};
  const olfactoryFamily = product?.olfactory_family;

  return (
    <div className="space-y-10" data-testid="notes-pyramid">
      {/* Tab Switcher for Rich Note Structure */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("pyramid")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "pyramid"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            Olfactory Pyramid ({tiers.reduce((acc, t) => acc + t.list.length, 0)} Notes)
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "architecture"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            Scent Architecture & Accords
          </button>
        </div>

        {olfactoryFamily && (
          <span className="pill text-xs font-semibold uppercase tracking-wider text-muted-foreground border border-border/60 bg-foreground/5">
            {olfactoryFamily}
          </span>
        )}
      </div>

      {/* Main Pyramid View */}
      {activeTab === "pyramid" && (
        <div className="divide-y border-y">
          {tiers.map((tier, i) => (
            <div key={tier.label} className="grid grid-cols-12 items-start gap-4 py-6">
              <div className="col-span-12 sm:col-span-4">
                <div className="flex items-baseline gap-2">
                  <p className="font-display text-2xl sm:text-3xl">{tier.label} notes</p>
                  <span className="text-xs font-bold text-muted-foreground opacity-80">
                    ({tier.list.length})
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {tier.sub}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/80 hidden sm:block max-w-[240px]">
                  {tier.desc}
                </p>
              </div>

              <div className="col-span-12 flex flex-wrap gap-2.5 sm:col-span-8">
                {tier.list.map((n, k) => (
                  <NotePill
                    key={n}
                    name={n}
                    color={color}
                    delay={i * 0.08 + k * 0.03}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Architecture & Accords View */}
      {activeTab === "architecture" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="space-y-8"
        >
          {/* Poetic Profile */}
          {architecture.profile && (
            <div className="rounded-2xl border bg-card/60 p-5 sm:p-6 backdrop-blur-sm">
              <p className="eyebrow text-xs">The Olfactory Journey</p>
              <p className="mt-2 text-sm sm:text-base leading-relaxed text-foreground/90 font-medium">
                {architecture.profile}
              </p>
            </div>
          )}

          {/* Main Accords Bars */}
          {accords.length > 0 && (
            <div className="rounded-2xl border bg-card/60 p-5 sm:p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display text-xl sm:text-2xl">Dominant Accords</p>
                <span className="text-xs text-muted-foreground">Harmonic Balance</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accords.map((a) => (
                  <div key={a.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm font-semibold">
                      <span>{a.name}</span>
                      <span className="text-muted-foreground">{a.pct}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${a.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: EASE }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color || "#D4A24C" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Pillars */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border bg-card/60 p-4 text-center backdrop-blur-sm">
              <Clock className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Longevity</p>
              <p className="mt-1 text-xs sm:text-sm font-bold text-foreground">
                {architecture.longevity?.split("·")[0] || "12+ Hours"}
              </p>
            </div>

            <div className="rounded-2xl border bg-card/60 p-4 text-center backdrop-blur-sm">
              <Wind className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sillage</p>
              <p className="mt-1 text-xs sm:text-sm font-bold text-foreground">
                {architecture.sillage?.split("·")[0] || "Intense Aura"}
              </p>
            </div>

            <div className="rounded-2xl border bg-card/60 p-4 text-center backdrop-blur-sm">
              <Calendar className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Season</p>
              <p className="mt-1 text-xs sm:text-sm font-bold text-foreground">
                {architecture.season?.split("/")[0] || "All Season"}
              </p>
            </div>

            <div className="rounded-2xl border bg-card/60 p-4 text-center backdrop-blur-sm">
              <Droplet className="mx-auto h-5 w-5 text-muted-foreground mb-2" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Concentration</p>
              <p className="mt-1 text-xs sm:text-sm font-bold text-foreground">
                EDP
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Accord Quick Strip below Pyramid view when tab is active */}
      {activeTab === "pyramid" && accords.length > 0 && (
        <div className="rounded-2xl border bg-card/40 p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="font-display text-lg sm:text-xl">Main Accords & Structure</p>
              <p className="text-xs text-muted-foreground">Signature olfactory fingerprint</p>
            </div>
            <button
              onClick={() => setActiveTab("architecture")}
              className="text-xs font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              View Full Architecture & Accords →
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {accords.map((a) => (
              <div
                key={a.name}
                className="inline-flex items-center gap-2.5 rounded-2xl border border-border/70 bg-background/70 px-4 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-current/40 hover:bg-background hover:shadow-sm"
              >
                <span className="text-xs sm:text-sm font-semibold whitespace-nowrap text-foreground">
                  {a.name}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{
                    backgroundColor: color ? `${color}20` : "rgba(0, 0, 0, 0.08)",
                    color: color || "currentColor",
                  }}
                >
                  {a.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
