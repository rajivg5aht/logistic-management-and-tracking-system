// Rough delivery-time estimate for the Book-a-Shipment map's second stat.
// Derived from the route distance and the selected service level — a friendly
// SLA hint, not a precise promise.

import type { ServiceType } from "@/context/ShipmentContext";

type Band = [maxKm: number, label: string];

function bandFor(distanceKm: number, bands: Band[]): string {
  for (const [max, label] of bands) {
    if (distanceKm < max) return label;
  }
  return bands[bands.length - 1][1];
}

export function estimateDeliveryTime(
  distanceKm: number,
  service: ServiceType,
): string {
  if (service === "overnight") return "Next day (Overnight)";

  const window =
    service === "express"
      ? bandFor(distanceKm, [
          [20, "Same day"],
          [100, "~1 day"],
          [250, "~1–2 days"],
          [Infinity, "~2–3 days"],
        ])
      : bandFor(distanceKm, [
          [20, "~1 day"],
          [100, "~1–2 days"],
          [250, "~2–3 days"],
          [Infinity, "~3–5 days"],
        ]);

  return `${window} (${service === "express" ? "Express" : "Standard"})`;
}
