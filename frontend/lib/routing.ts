import { haversineKm, type LatLng } from "./nepalGeo";

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

export type RouteResult = {
  distanceKm: number;
  geometry: LatLng[];
  approximate: boolean;
};

function straightLine(pickup: LatLng, delivery: LatLng): RouteResult {
  return {
    distanceKm: haversineKm(pickup, delivery),
    geometry: [pickup, delivery],
    approximate: true,
  };
}

export async function fetchRoute(
  pickup: LatLng,
  delivery: LatLng,
  signal?: AbortSignal,
): Promise<RouteResult> {
  const coords = `${pickup[1]},${pickup[0]};${delivery[1]},${delivery[0]}`;
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return straightLine(pickup, delivery);

    const data = await res.json();
    const route = data?.routes?.[0];
    const line = route?.geometry?.coordinates;
    if (!route || !Array.isArray(line) || line.length === 0) {
      return straightLine(pickup, delivery);
    }

    return {
      distanceKm: route.distance / 1000,
      geometry: line.map((c: [number, number]) => [c[1], c[0]] as LatLng),
      approximate: false,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return straightLine(pickup, delivery);
  }
}
