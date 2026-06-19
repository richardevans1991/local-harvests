"use client";

import { useEffect, useState } from "react";
import FarmStore from "@/components/FarmStore";
import { api } from "@/lib/api-client";
import type { Farm, Product } from "@/types";

interface FarmPageClientProps {
  id: string;
}

export default function FarmPageClient({ id }: FarmPageClientProps) {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.farms
      .get(id)
      .then(({ farm, products, categories: loadedCategories }) => {
        setFarm(farm);
        setProducts(products);
        setCategories(loadedCategories.map((c) => c.name));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="h-72 animate-pulse rounded-2xl bg-harvest-tan/40" />
      </div>
    );
  }

  if (notFound || !farm) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-serif text-2xl font-bold text-harvest-green">
          Farm not found
        </h1>
      </div>
    );
  }

  return <FarmStore farm={farm} products={products} categories={categories} />;
}