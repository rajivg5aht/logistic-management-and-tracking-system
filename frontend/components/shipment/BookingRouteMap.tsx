"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useShipment } from "@/context/ShipmentContext";
import { getDistrictCoords } from "@/lib/nepalGeo";
import { fetchRoute, type RouteResult } from "@/lib/routing";
import { estimateDeliveryTime } from "@/lib/delivery";

// Leaflet touches `window` at import time, so the map must never render on the
// server — load the inner component client-side only.
const BookingRouteMapInner = dynamic(() => import("./BookingRouteMapInner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#EEF2F7]" />,
});

export function BookingRouteMap() {
  const { pickupAddress, deliveryAddress, selectedService } = useShipment();

  // getDistrictCoords returns the same array reference for a given district, so
  // these are stable across renders until the selected district changes.
  const pickup = getDistrictCoords(pickupAddress.district);
  const delivery = getDistrictCoords(deliveryAddress.district);
  const bothSelected = Boolean(pickup && delivery);
  const routeKey = bothSelected
    ? `${pickupAddress.district}→${deliveryAddress.district}`
    : "";

  // The route is tagged with the district pair it was computed for, so a stale
  // result from a previous selection is ignored (derived, no setState-in-effect).
  const [route, setRoute] = useState<(RouteResult & { key: string }) | null>(null);

  useEffect(() => {
    if (!pickup || !delivery) return;

    const controller = new AbortController();
    let active = true;
    // Debounce so rapid district changes don't spam OSRM.
    const timer = setTimeout(() => {
      fetchRoute(pickup, delivery, controller.signal)
        .then((result) => {
          if (active) setRoute({ ...result, key: routeKey });
        })
        .catch(() => {
          // Aborted (superseded) or failed after fallback — nothing to show.
        });
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [pickup, delivery, routeKey]);

  const currentRoute = route && route.key === routeKey ? route : null;
  const loading = bothSelected && currentRoute === null;

  const distanceLabel = !bothSelected
    ? "—"
    : loading
      ? "Calculating…"
      : `${currentRoute!.approximate ? "~" : ""}${Math.round(currentRoute!.distanceKm)} km`;

  const deliveryLabel = currentRoute
    ? estimateDeliveryTime(currentRoute.distanceKm, selectedService)
    : "—";

  return (
    <div className="relative h-[250px] w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      {/* Map (own stacking context so the overlay always sits above Leaflet's
          tile/marker panes). */}
      <div className="absolute inset-0 z-0">
        <BookingRouteMapInner
          pickup={pickup}
          delivery={delivery}
          geometry={currentRoute?.geometry ?? []}
          approximate={currentRoute?.approximate ?? false}
        />
      </div>

      {/* Empty-state hint */}
      {!bothSelected && (
        <div className="pointer-events-none absolute left-1/2 top-3.5 z-20 -translate-x-1/2 rounded-full border border-[#E2E8F0] bg-white/95 px-3.5 py-1.5 text-center text-[11px] font-semibold text-slate-500 shadow-sm backdrop-blur-md">
          Select pickup &amp; delivery districts to draw the route
        </div>
      )}

      {/* Stats overlay */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white/95 p-4 shadow-sm backdrop-blur-md">
        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Estimated Distance
          </p>
          <p className="text-[15px] font-extrabold text-slate-800">{distanceLabel}</p>
        </div>
        <div className="text-right">
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Estimated Delivery
          </p>
          <p className="text-[15px] font-extrabold text-slate-800">{deliveryLabel}</p>
        </div>
      </div>
    </div>
  );
}
