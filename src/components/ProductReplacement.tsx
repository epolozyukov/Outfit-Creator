"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { formatPLN } from "@/lib/format";
import { SLOT_LABELS } from "@/lib/labels";
import type { Product, Slot } from "@/types";

interface Props {
  slot: Slot;
  alternatives: Product[];
  onSelect: (product: Product) => void;
  onClose: () => void;
}

const FOCUSABLE = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

export function ProductReplacement({ slot, alternatives, onSelect, onClose }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  const trapFocus = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const items = dialogRef.current!.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={trapFocus}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white"
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 id={titleId} className="font-heading text-2xl font-bold uppercase">
            Change {SLOT_LABELS[slot].toLowerCase()}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 focus-visible:outline-3 focus-visible:outline-black"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>

        {alternatives.length === 0 ? (
          <p className="p-6 text-muted">
            No other {SLOT_LABELS[slot].toLowerCase()} match your plans right now.
            Your current pick is the best fit — try another look instead.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            {alternatives.map((p) => (
              <li key={p.id} className="flex flex-col border border-line">
                <div className="relative aspect-square bg-surface">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    unoptimized
                    sizes="240px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="flex-1 font-heading text-lg font-bold uppercase leading-tight">
                    {p.name}
                  </p>
                  <p className="font-heading text-xl font-bold">
                    {formatPLN(p.priceMinor)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelect(p)}
                    aria-label={`Select ${p.name}`}
                    className="bg-black px-3 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-neutral-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Select
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
