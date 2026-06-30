"use client";

import SafeImage from "@/components/SafeImage";
import { formatMoney } from "@/lib/format-money";
import { useState } from "react";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cart-store";

interface ProductCardProps {
  product: Product;
  shopOpen?: boolean;
}

export default function ProductCard({ product, shopOpen = true }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!shopOpen) return;
    addItem({
      productId: product.id,
      farmId: product.farmId,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="farm-card flex flex-col overflow-hidden">
      <div className="relative h-44">
        <SafeImage
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-harvest-cream/95 px-2.5 py-1 text-xs font-semibold text-harvest-green shadow-sm">
          {product.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-semibold text-harvest-green">
          {product.name}
        </h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-harvest-brown/85">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="font-serif text-xl font-bold text-harvest-rust">
            {formatMoney(product.price)}
          </span>
          {shopOpen ? (
            <button
              type="button"
              onClick={handleAdd}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                added
                  ? "bg-harvest-wheat text-harvest-brown"
                  : "bg-harvest-green text-harvest-brown hover:bg-harvest-green-dark hover:text-white"
              }`}
            >
              {added ? "✓ Added!" : "Add to Cart"}
            </button>
          ) : (
            <span className="rounded-full bg-harvest-tan/50 px-4 py-2 text-xs font-semibold text-harvest-brown/70">
              Showcase only
            </span>
          )}
        </div>
      </div>
    </article>
  );
}