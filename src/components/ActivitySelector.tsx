"use client";

import { Dumbbell, Footprints, Goal, Shirt } from "lucide-react";
import { ACTIVITY_LABELS } from "@/lib/labels";
import type { Activity } from "@/types";
import { OptionGroup, type Option } from "./OptionGroup";

const OPTIONS: Option<Activity>[] = [
  { value: "running", label: ACTIVITY_LABELS.running, description: "Road, track and trail", icon: Footprints },
  { value: "gym", label: ACTIVITY_LABELS.gym, description: "Strength and fitness", icon: Dumbbell },
  { value: "football", label: ACTIVITY_LABELS.football, description: "Training and match day", icon: Goal },
  { value: "casual", label: ACTIVITY_LABELS.casual, description: "Everyday lifestyle", icon: Shirt },
];

interface Props {
  value: Activity | undefined;
  onChange: (value: Activity) => void;
}

export function ActivitySelector({ value, onChange }: Props) {
  return (
    <OptionGroup
      step="01"
      title="Select your activity"
      options={OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
