"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FarmCard from "@/components/FarmCard";
import SearchFilters from "@/components/SearchFilters";
import { api } from "@/lib/api-client";
import type { Farm } from "@/types";

export default function FarmDirectory() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [postcodeInput, setPostcodeInput] = useState("");
  const [activePostcode, setActivePostcode] = useState("");
  const [searchArea, setSearchArea] = useState<string | null>(null);

  const loadFarms = useCallback((postcode?: string) => {
    setLoading(true);
    setError("");
    return api.farms
      .list(postcode)
      .then(({ farms: loaded, search: searchMeta }) => {
        setFarms(loaded);
        setSearchArea(searchMeta?.area ?? searchMeta?.postcode ?? null);
      })
      .catch((err) => {
        setFarms([]);
        setSearchArea(null);
        setError(err instanceof Error ? err.message : "Failed to load farms.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  const handlePostcodeSearch = () => {
    const next = postcodeInput.trim();
    if (!next) {
      setActivePostcode("");
      loadFarms();
      return;
    }
    setActivePostcode(next);
    loadFarms(next);
  };

  const locationOptions = useMemo(() => {
    const unique = Array.from(new Set(farms.map((farm) => farm.location).filter(Boolean))).sort();
    return ["All Locations", ...unique];
  }, [farms]);

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
        postcode={postcodeInput}
        location={location}
        locations={locationOptions}
        onSearchChange={setSearch}
        onPostcodeChange={setPostcodeInput}
        onPostcodeSubmit={handlePostcodeSearch}
        onLocationChange={setLocation}
        searchArea={activePostcode ? searchArea : null}
      />

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-harvest-cream drop-shadow-sm">
            Local Farm Shops
          </h2>
          <span className="home-glass rounded-full px-3 py-1 text-sm text-harvest-brown/80">
            {loading
              ? "Loading..."
              : `${filteredFarms.length} farm${filteredFarms.length !== 1 ? "s" : ""} found`}
          </span>
        </div>

        {error && (
          <div className="home-glass mb-4 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="home-glass h-72 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : filteredFarms.length === 0 ? (
          <div className="home-glass rounded-2xl border border-dashed border-harvest-tan/60 p-12 text-center">
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