"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useShipment } from "@/context/ShipmentContext";
import { getDistrictCoords } from "@/lib/nepalGeo";
import { fetchRoute, type RouteResult } from "@/lib/routing";
import { estimateDeliveryTime } from "@/lib/delivery";

const BookingRouteMapInner = dynamic(() => import("./BookingRouteMapInner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#EEF2F7]" />,
});

export function BookingRouteMap() {
  const { pickupAddress, deliveryAddress, selectedService } = useShipment();

  const pickup = getDistrictCoords(pickupAddress.district);
  const delivery = getDistrictCoords(deliveryAddress.district);
  const bothSelected = Boolean(pickup && delivery);
  const routeKey = bothSelected
    ? `${pickupAddress.district}→${deliveryAddress.district}`
    : "";

  const [route, setRoute] = useState<(RouteResult & { key: string }) | null>(null);

  useEffect(() => {
    if (!pickup || !delivery) return;

    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => {
      fetchRoute(pickup, delivery, controller.signal)
        .then((result) => {
          if (active) setRoute({ ...result, key: routeKey });
        })
        .catch(() => {
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
      <div className="absolute inset-0 z-0">
        <BookingRouteMapInner
          pickup={pickup}
          delivery={delivery}
          geometry={currentRoute?.geometry ?? []}
          approximate={currentRoute?.approximate ?? false}
        />
      </div>

      {!bothSelected && (
        <div className="pointer-events-none absolute left-1/2 top-3.5 z-20 -translate-x-1/2 rounded-full border border-[#E2E8F0] bg-white/95 px-3.5 py-1.5 text-center text-[11px] font-semibold text-slate-500 shadow-sm backdrop-blur-md">
          Select pickup &amp; delivery districts to draw the route
        </div>
      )}

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
