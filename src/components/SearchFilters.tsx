"use client";

interface SearchFiltersProps {
  search: string;
  postcode: string;
  location: string;
  locations: string[];
  onSearchChange: (value: string) => void;
  onPostcodeChange: (value: string) => void;
  onPostcodeSubmit: () => void;
  onLocationChange: (value: string) => void;
  searchArea?: string | null;
}

export default function SearchFilters({
  search,
  postcode,
  location,
  locations,
  onSearchChange,
  onPostcodeChange,
  onPostcodeSubmit,
  onLocationChange,
  searchArea,
}: SearchFiltersProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-3 px-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row">
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
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          onPostcodeSubmit();
        }}
      >
        <div className="relative flex-1 sm:max-w-xs">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-harvest-brown/50">
            📍
          </span>
          <input
            type="text"
            inputMode="text"
            autoComplete="postal-code"
            placeholder="Your postcode (e.g. BH24 1PA)"
            value={postcode}
            onChange={(e) => onPostcodeChange(e.target.value)}
            className="home-glass w-full rounded-xl border border-harvest-tan/70 py-3 pl-11 pr-4 text-harvest-brown shadow-sm outline-none transition focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-harvest-green px-5 py-3 text-sm font-semibold text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white"
        >
          Find farms near you
        </button>
        {searchArea && (
          <p className="text-sm text-harvest-cream/90 sm:ml-2">
            Showing farms near <strong>{searchArea}</strong>
          </p>
        )}
      </form>
    </div>
  );
}