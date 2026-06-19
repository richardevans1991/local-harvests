"use client";

import { useEffect, useMemo, useState } from "react";
import FarmCard from "@/components/FarmCard";
import SearchFilters from "@/components/SearchFilters";
import { api } from "@/lib/api-client";
import type { Farm } from "@/types";

export default function FarmDirectory() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");

  useEffect(() => {
    api.farms
      .list()
      .then(({ farms }) => setFarms(farms))
      .catch(() => setFarms([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredFarms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return farms.filter((farm) => {
      const matchesSearch =
        !query ||
        farm.name.toLowerCase().includes(query) ||
        farm.shortDescription.toLowerCase().includes(query) ||
        farm.description.toLowerCase().includes(query);
      const matchesLocation =
        location === "All Locations" || farm.location === location;
      return matchesSearch && matchesLocation;
    });
  }, [farms, search, location]);

  return (
    <section className="py-10">
      <SearchFilters
        search={search}
        location={location}
        onSearchChange={setSearch}
        onLocationChange={setLocation}
      />

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-harvest-green">
            Local Farm Shops
          </h2>
          <span className="text-sm text-harvest-brown/70">
            {loading
              ? "Loading..."
              : `${filteredFarms.length} farm${filteredFarms.length !== 1 ? "s" : ""} found`}
          </span>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-harvest-tan/40"
              />
            ))}
          </div>
        ) : filteredFarms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-harvest-tan bg-white p-12 text-center">
            <p className="text-harvest-brown">No farms match your search.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFarms.map((farm) => (
              <FarmCard key={farm.id} farm={farm} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}