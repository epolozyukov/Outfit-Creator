export type Activity = "running" | "gym" | "football" | "casual";
export type Weather = "hot" | "mild" | "cold" | "rainy";
export type Style = "performance" | "minimal" | "bold" | "streetwear";
export type Slot =
  | "shoes"
  | "top"
  | "bottom"
  | "socks"
  | "jacket"
  | "accessory";

export interface Product {
  id: string;
  name: string;
  category: Slot;
  image: string;
  /** Integer grosz, e.g. 34999 = 349.99 PLN */
  priceMinor: number;
  currency: "PLN";
  color: string;
  activities: Activity[];
  weatherTags: Weather[];
  styleTags: Style[];
  description: string;
  productUrl?: string;
}

export interface Prefs {
  activity: Activity;
  weather: Weather;
  style: Style;
}

export interface OutfitItem {
  slot: Slot;
  product: Product;
}

export interface Outfit {
  prefs: Prefs;
  items: OutfitItem[];
}
