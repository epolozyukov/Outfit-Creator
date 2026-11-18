import type { Activity, Slot, Style, Weather } from "@/types";

export const ACTIVITY_LABELS: Record<Activity, string> = {
  running: "Running",
  gym: "Gym",
  football: "Football",
  casual: "Casual",
};

export const WEATHER_LABELS: Record<Weather, string> = {
  hot: "Hot & sunny",
  mild: "Mild & dry",
  cold: "Cold & dry",
  rainy: "Wet & rainy",
};

export const STYLE_LABELS: Record<Style, string> = {
  performance: "Performance",
  minimal: "Minimal",
  bold: "Bold",
  streetwear: "Streetwear",
};

export const SLOT_LABELS: Record<Slot, string> = {
  shoes: "Shoes",
  top: "Top",
  bottom: "Bottoms",
  socks: "Socks",
  jacket: "Jacket",
  accessory: "Accessory",
};
