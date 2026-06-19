"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Farm, Product } from "@/types";

interface FarmStoreProps {
  farm: Farm;
  products: Product[];
  categories?: string[];
}

export default function FarmStore({ farm, products, categories = [] }: FarmStoreProps) {
  const [category, setCategory] = useState<string>("All");

  const availableCategories = useMemo(() => {
    const fromDb = categories.length > 0 ? categories : products.map((p) => p.category);
    return Array.from(new Set(fromDb)).sort();
  }, [products, categories]);

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
            📍 {farm.location} · {farm.distance} miles away
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
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
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("All")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              category === "All"
                ? "bg-harvest-green text-harvest-brown shadow-sm"
                : "bg-white/80 text-harvest-brown ring-1 ring-harvest-wheat/60 hover:bg-harvest-parchment"
            }`}
          >
            All
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                category === cat
                  ? "bg-harvest-green text-harvest-brown shadow-sm"
                  : "bg-white/80 text-harvest-brown ring-1 ring-harvest-wheat/60 hover:bg-harvest-parchment"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="farm-panel p-12 text-center">
            <p className="text-harvest-brown">No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}