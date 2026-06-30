const EARTH_RADIUS_MILES = 3958.8;

export function normalizeUkPostcode(value: string) {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  if (compact.length < 5 || compact.length > 8) return null;
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(compact)) return null;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_MILES * c * 10) / 10;
}

interface PostcodeResult {
  postcode: string;
  latitude: number;
  longitude: number;
  area: string | null;
}

async function postcodesFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.postcodes.io${path}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { status: number; result: T | null };
    if (data.status !== 200 || !data.result) return null;
    return data.result;
  } catch {
    return null;
  }
}

export async function lookupUkPostcode(raw: string): Promise<PostcodeResult | null> {
  const postcode = normalizeUkPostcode(raw);
  if (!postcode) return null;

  const result = await postcodesFetch<{
    postcode: string;
    latitude: number;
    longitude: number;
    admin_district: string | null;
    parish: string | null;
  }>(`/postcodes/${encodeURIComponent(postcode)}`);

  if (!result) return null;

  return {
    postcode: result.postcode,
    latitude: result.latitude,
    longitude: result.longitude,
    area: result.parish ?? result.admin_district,
  };
}

export async function lookupUkPlace(query: string): Promise<PostcodeResult | null> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return null;

  const result = await postcodesFetch<
    Array<{
      postcode_terminate: string;
      latitude: number;
      longitude: number;
      name: string;
    }>
  >(`/places?q=${encodeURIComponent(trimmed)}&limit=1`);

  const place = Array.isArray(result) ? result[0] : null;
  if (!place) return null;

  return {
    postcode: place.postcode_terminate,
    latitude: place.latitude,
    longitude: place.longitude,
    area: place.name,
  };
}

export async function resolveFarmCoordinates(
  postcode?: string | null,
  location?: string | null
) {
  if (postcode?.trim()) {
    const fromPostcode = await lookupUkPostcode(postcode);
    if (fromPostcode) {
      return {
        postcode: fromPostcode.postcode,
        latitude: fromPostcode.latitude,
        longitude: fromPostcode.longitude,
      };
    }
  }

  if (location?.trim()) {
    const fromPlace = await lookupUkPlace(location);
    if (fromPlace) {
      return {
        postcode: fromPlace.postcode,
        latitude: fromPlace.latitude,
        longitude: fromPlace.longitude,
      };
    }
  }

  return { postcode: null, latitude: null, longitude: null };
}

export function attachDistanceMiles<
  T extends { latitude: number | null; longitude: number | null },
>(farms: T[], origin: { latitude: number; longitude: number }) {
  return farms
    .map((farm) => {
      const distanceMiles =
        farm.latitude != null && farm.longitude != null
          ? haversineMiles(origin.latitude, origin.longitude, farm.latitude, farm.longitude)
          : null;
      return { ...farm, distanceMiles };
    })
    .sort((a, b) => {
      if (a.distanceMiles == null && b.distanceMiles == null) return 0;
      if (a.distanceMiles == null) return 1;
      if (b.distanceMiles == null) return -1;
      return a.distanceMiles - b.distanceMiles;
    });
}