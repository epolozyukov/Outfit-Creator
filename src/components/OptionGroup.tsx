"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";

export interface Option<T extends string> {
  value: T;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface Props<T extends string> {
  title: string;
  step: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
const PREV_KEYS = ["ArrowLeft", "ArrowUp"];

export function OptionGroup<T extends string>({
  title,
  step,
  options,
  value,
  onChange,
}: Props<T>) {
  const titleId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const delta = NEXT_KEYS.includes(e.key) ? 1 : PREV_KEYS.includes(e.key) ? -1 : 0;
    if (delta === 0) return;
    e.preventDefault();
    const selected = options.findIndex((o) => o.value === value);
    const base = selected >= 0 ? selected : index;
    const next = (base + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <section className="space-y-4">
      <h2
        id={titleId}
        className="font-heading text-2xl font-bold uppercase tracking-wide sm:text-3xl"
      >
        <span className="mr-3 text-muted">{step}</span>
        {title}
      </h2>
      <div
        role="radiogroup"
        aria-labelledby={titleId}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {options.map((o, i) => {
          const selected = o.value === value;
          const tabbable = selected || (value === undefined && i === 0);
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={tabbable ? 0 : -1}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`flex min-h-32 flex-col items-start justify-between gap-4 border-2 p-4 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black ${
                selected
                  ? "border-black bg-black text-white"
                  : "border-line bg-white hover:border-black"
              }`}
            >
              <Icon aria-hidden="true" className="size-7" strokeWidth={1.75} />
              <span>
                <span className="block font-heading text-xl font-bold uppercase leading-tight">
                  {o.label}
                </span>
                <span
                  className={`block text-sm ${selected ? "text-white/80" : "text-muted"}`}
                >
                  {o.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
