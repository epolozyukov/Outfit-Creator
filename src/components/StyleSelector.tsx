"use client";

import { Circle, Flame, Layers, Zap } from "lucide-react";
import { STYLE_LABELS } from "@/lib/labels";
import type { Style } from "@/types";
import { OptionGroup, type Option } from "./OptionGroup";

const OPTIONS: Option<Style>[] = [
  { value: "performance", label: STYLE_LABELS.performance, description: "Functional training gear", icon: Zap },
  { value: "minimal", label: STYLE_LABELS.minimal, description: "Clean and neutral", icon: Circle },
  { value: "bold", label: STYLE_LABELS.bold, description: "Expressive colour", icon: Flame },
  { value: "streetwear", label: STYLE_LABELS.streetwear, description: "Oversized, lifestyle-led", icon: Layers },
];

interface Props {
  value: Style | undefined;
  onChange: (value: Style) => void;
}

export function StyleSelector({ value, onChange }: Props) {
  return (
    <OptionGroup
      step="03"
      title="Choose your style"
      options={OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
