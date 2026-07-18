"use client";

import dynamic from "next/dynamic";
import { Clock3, Loader2, MapPin, Route } from "lucide-react";
import type { LatLng } from "@/lib/nepalGeo";
import { useLiveRoute } from "@/lib/hooks/useLiveRoute";

const LiveTrackingMapInner = dynamic(() => import("./LiveTrackingMapInner"), {
  ssr: false,
  loading: () => <MapMessage icon={<Loader2 size={18} className="animate-spin" />} text="Loading map…" />,
});

type MapLocation = {
  latitude: number;
  longitude: number;
  speed?: number | null;
  updatedAt?: string;
} | null;

type Props = {
  location: MapLocation;
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
  delivery = null,
  height = 240,
  accent,
  waitingLabel = "Waiting for driver location…",
}: Props) {
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;
  const route = useLiveRoute(delivery, location);
  const hasMapContext = Boolean(location || delivery);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-[var(--border,#e5e7eb)]"
      style={{ height: resolvedHeight }}
    >
      {hasMapContext ? (
        <LiveTrackingMapInner
          location={location}
          delivery={delivery}
          geometry={route.geometry}
          approximate={route.approximate}
          accent={accent}
        />
      ) : (
        <MapMessage icon={<MapPin size={18} />} text={waitingLabel} />
      )}
      {!location && delivery && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-[500] -translate-x-1/2 rounded-full border border-[var(--border)] bg-white/95 px-3 py-1.5 text-center text-[11px] font-semibold text-[var(--text-muted)] shadow-sm backdrop-blur">
          {waitingLabel}
        </div>
      )}
      {location && route.remainingDistanceKm !== null && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute bottom-3 right-3 z-[500] grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#0C3B67]/12 bg-white/95 shadow-lg backdrop-blur"
        >
          <div className="min-w-24 px-3 py-2">
            <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              <Route size={11} /> Remaining
            </p>
            <p className="mt-0.5 text-sm font-black text-[#0C3B67]">
              {route.remainingDistanceLabel}
            </p>
          </div>
          <div className="min-w-24 border-l border-[var(--border)] px-3 py-2">
            <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              <Clock3 size={11} /> ETA
            </p>
            <p className="mt-0.5 text-sm font-black text-[#0C3B67]">
              {route.etaLabel}
            </p>
            {route.arrivalLabel && route.etaMinutes !== 0 && (
              <p className="text-[9px] font-bold text-[var(--text-muted)]">
                by {route.arrivalLabel}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
