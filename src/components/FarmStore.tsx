"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import SafeImage from "@/components/SafeImage";
import type { Farm, FarmCategory, Product } from "@/types";

interface FarmStoreProps {
  farm: Farm;
  products: Product[];
  categories?: FarmCategory[];
}

export default function FarmStore({ farm, products, categories = [] }: FarmStoreProps) {
  const [category, setCategory] = useState<string>("All");

  const availableCategories = useMemo(() => {
    if (categories.length > 0) {
      return [...categories].sort((a, b) => a.name.localeCompare(b.name));
    }
    const names = Array.from(new Set(products.map((p) => p.category))).sort();
    return names.map((name) => ({ id: name, farmId: farm.id, name, image: null }));
  }, [products, categories, farm.id]);

  const filteredProducts = useMemo(() => {
    if (category === "All") return products;
    return products.filter((p) => p.category === category);
  }, [products, category]);

  return (
    <div>
      <div className="relative h-56 sm:h-72">
        <Image
          src={farm.banner}
          alt={`${farm.name} banner`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-harvest-brown/80 via-harvest-brown/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-harvest-cream sm:p-10">
          <Link
            href="/"
            className="mb-3 inline-block text-sm text-harvest-parchment/90 hover:text-white"
          >
            ← Back to all farms
          </Link>
          <h1 className="font-serif text-3xl font-bold text-harvest-green-light sm:text-4xl">
            {farm.name}
          </h1>
          <p className="mt-2 max-w-2xl text-harvest-parchment/95">{farm.description}</p>
          <p className="mt-2 text-sm text-harvest-wheat">
            📍 {farm.location}
            {farm.postcode && ` · ${farm.postcode}`}
            {farm.distanceMiles != null && farm.distanceMiles > 0
              ? ` · ${farm.distanceMiles} miles away`
              : farm.distance > 0
                ? ` · ${farm.distance} miles away`
                : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {farm.shopOpen === false && (
              <span className="rounded-full bg-harvest-wheat/95 px-3 py-1 text-xs font-semibold text-harvest-brown">
                Showcase — orders closed
              </span>
            )}
            {farm.offersPickup && (
              <span className="rounded-full bg-harvest-green/90 px-3 py-1 text-xs font-semibold text-harvest-brown">
                Click &amp; Collect
              </span>
            )}
            {farm.offersDelivery && (
              <span className="rounded-full bg-harvest-wheat/90 px-3 py-1 text-xs font-semibold text-harvest-brown">
                Delivery available
              </span>
            )}
          </div>
          {farm.offersDelivery && farm.deliveryNotes && (
            <p className="mt-2 text-sm text-harvest-parchment/90">{farm.deliveryNotes}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {farm.shopOpen === false && (
          <div className="mb-6 rounded-xl border border-harvest-wheat/80 bg-harvest-parchment/60 px-4 py-3 text-sm text-harvest-brown">
            This farm shop is <strong>open for browsing only</strong> — customers can view
            products but cannot place orders right now.
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          <CategoryChip
            label="All"
            selected={category === "All"}
            onSelect={() => setCategory("All")}
          />
          {availableCategories.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.name}
              image={cat.image}
              selected={category === cat.name}
              onSelect={() => setCategory(cat.name)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="farm-panel p-12 text-center">
            <p className="text-harvest-brown">No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                shopOpen={farm.shopOpen !== false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  image,
  selected,
  onSelect,
}: {
  label: string;
  image?: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold transition ${
        selected
          ? "bg-harvest-green text-harvest-brown shadow-sm"
          : "bg-white/80 text-harvest-brown ring-1 ring-harvest-wheat/60 hover:bg-harvest-parchment"
      }`}
    >
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-harvest-parchment/80">
        {image ? (
          <SafeImage src={image} alt={label} fill className="object-cover" sizes="32px" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-harvest-brown/50">
            {label === "All" ? "✦" : "🏷️"}
          </span>
        )}
      </span>
      {label}
    </button>
  );
}