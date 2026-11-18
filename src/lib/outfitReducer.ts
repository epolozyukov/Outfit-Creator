import type { Activity, Outfit, Prefs, Product, Slot, Style, Weather } from "@/types";
import {
  IncompleteCatalogueError,
  generateOutfit,
  replaceItem,
  type Rng,
} from "./outfitGenerator";

export interface State {
  prefs: Partial<Prefs>;
  outfit: Outfit | null;
  replacingSlot: Slot | null;
  view: "config" | "outfit";
  error: string | null;
  notice: string | null;
}

export type Action =
  | { type: "SELECT_ACTIVITY"; value: Activity }
  | { type: "SELECT_WEATHER"; value: Weather }
  | { type: "SELECT_STYLE"; value: Style }
  | { type: "GENERATE"; catalogue: Product[]; rng?: Rng }
  | { type: "REGENERATE"; catalogue: Product[]; rng?: Rng }
  | { type: "OPEN_REPLACE"; slot: Slot }
  | { type: "CLOSE_REPLACE" }
  | { type: "REPLACE"; product: Product }
  | { type: "BACK" };

export const initialState: State = {
  prefs: {},
  outfit: null,
  replacingSlot: null,
  view: "config",
  error: null,
  notice: null,
};

const ERROR_MESSAGE =
  "We couldn't build a complete outfit for these preferences. Please try different options.";
const NO_OTHER_LOOK =
  "No other look available with these preferences – showing the current one.";

const isComplete = (p: Partial<Prefs>): p is Prefs =>
  Boolean(p.activity && p.weather && p.style);

const ids = (o: Outfit) => o.items.map((i) => i.product.id).join(",");

export function outfitReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_ACTIVITY":
      return { ...state, prefs: { ...state.prefs, activity: action.value } };
    case "SELECT_WEATHER":
      return { ...state, prefs: { ...state.prefs, weather: action.value } };
    case "SELECT_STYLE":
      return { ...state, prefs: { ...state.prefs, style: action.value } };

    case "GENERATE": {
      if (!isComplete(state.prefs)) return state;
      try {
        const outfit = generateOutfit(state.prefs, action.catalogue, {
          rng: action.rng,
        });
        return { ...state, outfit, view: "outfit", error: null, notice: null };
      } catch (e) {
        if (e instanceof IncompleteCatalogueError) {
          return { ...state, outfit: null, view: "config", error: ERROR_MESSAGE };
        }
        throw e;
      }
    }

    case "REGENERATE": {
      if (!state.outfit || !isComplete(state.prefs)) return state;
      try {
        const outfit = generateOutfit(state.prefs, action.catalogue, {
          rng: action.rng,
          exclude: state.outfit,
        });
        const same = ids(outfit) === ids(state.outfit);
        return {
          ...state,
          outfit,
          error: null,
          notice: same ? NO_OTHER_LOOK : null,
        };
      } catch (e) {
        if (e instanceof IncompleteCatalogueError) {
          return { ...state, error: ERROR_MESSAGE };
        }
        throw e;
      }
    }

    case "OPEN_REPLACE":
      return { ...state, replacingSlot: action.slot };
    case "CLOSE_REPLACE":
      return { ...state, replacingSlot: null };

    case "REPLACE": {
      if (!state.outfit || !state.replacingSlot) return state;
      return {
        ...state,
        outfit: replaceItem(state.outfit, state.replacingSlot, action.product),
        replacingSlot: null,
        notice: null,
      };
    }

    case "BACK":
      return { ...state, view: "config", replacingSlot: null, notice: null };
  }
}
