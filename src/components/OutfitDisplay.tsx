import { ArrowLeft, RefreshCw } from "lucide-react";
import { formatPLN } from "@/lib/format";
import { ACTIVITY_LABELS, STYLE_LABELS, WEATHER_LABELS } from "@/lib/labels";
import { calculateTotal } from "@/lib/outfitGenerator";
import type { Outfit, Slot } from "@/types";
import { ProductCard } from "./ProductCard";

interface Props {
  outfit: Outfit;
  explanation: string;
  notice: string | null;
  onChangeItem: (slot: Slot) => void;
  onRegenerate: () => void;
  onBack: () => void;
}

export function OutfitDisplay({
  outfit,
  explanation,
  notice,
  onChangeItem,
  onRegenerate,
  onBack,
}: Props) {
  const { prefs } = outfit;
  const summary: [string, string][] = [
    ["Activity", ACTIVITY_LABELS[prefs.activity]],
    ["Weather", WEATHER_LABELS[prefs.weather]],
    ["Style", STYLE_LABELS[prefs.style]],
    ["Items", String(outfit.items.length)],
  ];

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="font-heading text-5xl font-extrabold uppercase leading-none sm:text-7xl">
          Your Outfit Is Ready!
        </h1>
        <p className="max-w-2xl text-lg text-muted">{explanation}</p>
        {notice && (
          <p role="status" className="border-l-4 border-black bg-surface p-3 text-sm">
            {notice}
          </p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {outfit.items.map((i) => (
          <ProductCard
            key={i.slot}
            slot={i.slot}
            product={i.product}
            onChange={onChangeItem}
          />
        ))}
      </div>

      <section
        aria-label="Outfit summary"
        className="grid gap-6 bg-surface p-6 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {summary.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-bold uppercase tracking-widest text-muted">
                {k}
              </dt>
              <dd className="font-heading text-xl font-bold uppercase">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="sm:text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Total estimated price
          </p>
          <p data-testid="outfit-total" className="font-heading text-5xl font-extrabold">
            {formatPLN(calculateTotal(outfit))}
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex items-center justify-center gap-2 bg-black px-8 py-4 font-bold uppercase tracking-widest text-white hover:bg-neutral-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <RefreshCw aria-hidden="true" className="size-5" />
          Generate Another Look
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 border-2 border-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-black hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          Back to Preferences
        </button>
      </div>
    </div>
  );
}
