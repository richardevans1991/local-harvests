"use client";

import { LOCATIONS } from "@/types";

interface SearchFiltersProps {
  search: string;
  location: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

export default function SearchFilters({
  search,
  location,
  onSearchChange,
  onLocationChange,
}: SearchFiltersProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:px-6">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-harvest-brown/50">
          🔍
        </span>
        <input
          type="search"
          placeholder="Search farms by name or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="home-glass w-full rounded-xl border border-harvest-tan/70 py-3 pl-11 pr-4 text-harvest-brown shadow-sm outline-none transition focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
        />
      </div>
      <select
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        className="home-glass rounded-xl border border-harvest-tan/70 px-4 py-3 text-harvest-brown shadow-sm outline-none transition focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20 sm:w-52"
      >
        {LOCATIONS.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
    </div>
  );
}