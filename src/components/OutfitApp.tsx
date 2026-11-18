"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { products } from "@/data/products";
import {
  buildExplanation,
  getAlternatives,
  type Rng,
} from "@/lib/outfitGenerator";
import { initialState, outfitReducer } from "@/lib/outfitReducer";
import type { Product } from "@/types";
import { ActivitySelector } from "./ActivitySelector";
import { OutfitDisplay } from "./OutfitDisplay";
import { ProductReplacement } from "./ProductReplacement";
import { StyleSelector } from "./StyleSelector";
import { WeatherSelector } from "./WeatherSelector";

interface Props {
  catalogue?: Product[];
  rng?: Rng;
  /** Short artificial delay so users get feedback while the outfit is "created". */
  loadingMs?: number;
}

export function OutfitApp({ catalogue = products, rng, loadingMs = 600 }: Props) {
  const [state, dispatch] = useReducer(outfitReducer, initialState);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const { prefs, outfit, replacingSlot, view, error, notice } = state;
  const ready = Boolean(prefs.activity && prefs.weather && prefs.style);

  const generate = () => {
    setLoading(true);
    timer.current = setTimeout(() => {
      dispatch({ type: "GENERATE", catalogue, rng });
      setLoading(false);
    }, loadingMs);
  };

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
      >
        <Loader2 aria-hidden="true" className="size-10 animate-spin" />
        <p className="font-heading text-3xl font-bold uppercase">
          Creating your outfit…
        </p>
      </div>
    );
  }

  if (view === "outfit" && outfit) {
    return (
      <>
        <OutfitDisplay
          outfit={outfit}
          explanation={buildExplanation(outfit.prefs, outfit)}
          notice={notice}
          onChangeItem={(slot) => dispatch({ type: "OPEN_REPLACE", slot })}
          onRegenerate={() => dispatch({ type: "REGENERATE", catalogue, rng })}
          onBack={() => dispatch({ type: "BACK" })}
        />
        {replacingSlot && (
          <ProductReplacement
            slot={replacingSlot}
            alternatives={getAlternatives(outfit, replacingSlot, catalogue)}
            onSelect={(product) => dispatch({ type: "REPLACE", product })}
            onClose={() => dispatch({ type: "CLOSE_REPLACE" })}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="font-heading text-5xl font-extrabold uppercase leading-none sm:text-7xl">
          Create Your Perfect Look.
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Tell us where you&apos;re going, what the weather looks like and how
          you want to look. We&apos;ll create your outfit.
        </p>
      </header>

      <ActivitySelector
        value={prefs.activity}
        onChange={(value) => dispatch({ type: "SELECT_ACTIVITY", value })}
      />
      <WeatherSelector
        value={prefs.weather}
        onChange={(value) => dispatch({ type: "SELECT_WEATHER", value })}
      />
      <StyleSelector
        value={prefs.style}
        onChange={(value) => dispatch({ type: "SELECT_STYLE", value })}
      />

      <div className="space-y-3">
        {error && (
          <p role="alert" className="border-l-4 border-black bg-surface p-3">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={!ready}
          onClick={generate}
          aria-describedby="create-help"
          className="w-full bg-black px-8 py-5 font-heading text-2xl font-bold uppercase tracking-widest text-white hover:bg-neutral-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 sm:w-auto"
        >
          Create My Outfit
        </button>
        <p id="create-help" className="text-sm text-muted">
          {ready
            ? "All set — create your outfit."
            : "Choose an activity, weather and style to continue."}
        </p>
      </div>
    </div>
  );
}
