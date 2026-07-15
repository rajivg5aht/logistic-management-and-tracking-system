"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { fetchRoute, type RouteResult } from "@/lib/routing";
import type { LatLng } from "@/lib/nepalGeo";

const LiveTrackingMapInner = dynamic(() => import("./LiveTrackingMapInner"), {
  ssr: false,
  loading: () => <MapMessage icon={<Loader2 size={18} className="animate-spin" />} text="Loading map…" />,
});

type MapLocation = {
  latitude: number;
  longitude: number;
} | null;

type Props = {
  location: MapLocation;
  pickup?: LatLng | null;
  delivery?: LatLng | null;
  height?: number | string;
  accent?: string;
  waitingLabel?: string;
};

function MapMessage({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--surface-soft,#F3F1E9)] text-center">
      <span className="text-[var(--text-muted,#6b7280)]">{icon}</span>
      <p className="text-xs font-semibold text-[var(--text-muted,#6b7280)]">{text}</p>
    </div>
  );
}

export default function LiveMap({
  location,
  pickup = null,
  delivery = null,
  height = 240,
  accent,
  waitingLabel = "Waiting for driver location…",
}: Props) {
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;
  const routeKey =
    pickup && delivery ? `${pickup.join(",")}→${delivery.join(",")}` : "";
  const [route, setRoute] = useState<(RouteResult & { key: string }) | null>(null);

  useEffect(() => {
    if (!pickup || !delivery) return;

    const controller = new AbortController();
    let active = true;

    fetchRoute(pickup, delivery, controller.signal)
      .then((result) => {
        if (active) setRoute({ ...result, key: routeKey });
      })
      .catch(() => {
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [delivery, pickup, routeKey]);

  const currentRoute = route?.key === routeKey ? route : null;
  const hasMapContext = Boolean(location || pickup || delivery);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-[var(--border,#e5e7eb)]"
      style={{ height: resolvedHeight }}
    >
      {hasMapContext ? (
        <LiveTrackingMapInner
          location={location}
          pickup={pickup}
          delivery={delivery}
          geometry={currentRoute?.geometry ?? []}
          approximate={currentRoute?.approximate ?? false}
          accent={accent}
        />
      ) : (
        <MapMessage icon={<MapPin size={18} />} text={waitingLabel} />
      )}
      {!location && (pickup || delivery) && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-[500] -translate-x-1/2 rounded-full border border-[var(--border)] bg-white/95 px-3 py-1.5 text-center text-[11px] font-semibold text-[var(--text-muted)] shadow-sm backdrop-blur">
          {waitingLabel}
        </div>
      )}
    </div>
  );
}
