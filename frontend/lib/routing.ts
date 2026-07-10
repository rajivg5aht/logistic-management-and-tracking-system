// Road routing for the Book-a-Shipment map. Uses the public OSRM demo server
// for a real driving route + distance, and falls back to a straight line +
// great-circle distance when OSRM is unavailable (it's a free, best-effort host).

import { haversineKm, type LatLng } from "./nepalGeo";

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

export type RouteResult = {
  distanceKm: number;
  geometry: LatLng[]; // [lat, lng] points for a Leaflet Polyline
  approximate: boolean; // true = straight-line fallback (OSRM unavailable)
};

function straightLine(pickup: LatLng, delivery: LatLng): RouteResult {
  return {
    distanceKm: haversineKm(pickup, delivery),
    geometry: [pickup, delivery],
    approximate: true,
  };
}

/**
 * Fetch the driving route between two points. Resolves to a real OSRM route, or
 * a straight-line approximation on any error. Pass an AbortSignal so stale
 * requests (from rapid district changes) can be cancelled by the caller.
 */
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
      // OSRM GeoJSON is [lng, lat]; Leaflet wants [lat, lng].
      geometry: line.map((c: [number, number]) => [c[1], c[0]] as LatLng),
      approximate: false,
    };
  } catch (error) {
    // Re-throw aborts so the caller can ignore them instead of showing a route.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return straightLine(pickup, delivery);
  }
}
