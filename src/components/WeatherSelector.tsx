"use client";

import { CloudRain, CloudSun, Snowflake, Sun } from "lucide-react";
import { WEATHER_LABELS } from "@/lib/labels";
import type { Weather } from "@/types";
import { OptionGroup, type Option } from "./OptionGroup";

const OPTIONS: Option<Weather>[] = [
  { value: "hot", label: WEATHER_LABELS.hot, description: "20°C and above", icon: Sun },
  { value: "mild", label: WEATHER_LABELS.mild, description: "12–19°C", icon: CloudSun },
  { value: "cold", label: WEATHER_LABELS.cold, description: "Below 12°C", icon: Snowflake },
  { value: "rainy", label: WEATHER_LABELS.rainy, description: "Rain-ready layers", icon: CloudRain },
];

interface Props {
  value: Weather | undefined;
  onChange: (value: Weather) => void;
}

export function WeatherSelector({ value, onChange }: Props) {
  return (
    <OptionGroup
      step="02"
      title="Select the weather"
      options={OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
