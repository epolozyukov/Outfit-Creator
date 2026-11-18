import Image from "next/image";
import { formatPLN } from "@/lib/format";
import { SLOT_LABELS } from "@/lib/labels";
import type { Product, Slot } from "@/types";

interface Props {
  slot: Slot;
  product: Product;
  onChange: (slot: Slot) => void;
}

export function ProductCard({ slot, product, onChange }: Props) {
  return (
    <article className="flex flex-col border border-line bg-white">
      <div className="relative aspect-square bg-surface">
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            {SLOT_LABELS[slot]}
          </p>
          <h2 className="font-heading text-xl font-bold uppercase leading-tight">
            {product.name}
          </h2>
          <p className="text-sm capitalize text-muted">{product.color}</p>
        </div>
        <p className="font-heading text-2xl font-bold">
          {formatPLN(product.priceMinor)}
        </p>
        <button
          type="button"
          onClick={() => onChange(slot)}
          aria-label={`Change item: ${product.name}`}
          className="border-2 border-black px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-black hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Change item
        </button>
      </div>
    </article>
  );
}
