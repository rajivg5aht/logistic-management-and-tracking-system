"use client";

import dynamic from "next/dynamic";
import { Loader2, MapPin } from "lucide-react";

// Leaflet touches `window` at module load, so it must never render on the
// server. Next 16 only allows `ssr: false` inside a Client Component, which
// this wrapper is — every consumer imports this file, not the inner map.
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

// Renders the live driver marker, or a "waiting" state until the first fix.
export default function LiveMap({
  location,
  height = 240,
  accent,
  waitingLabel = "Waiting for driver location…",
}: Props) {
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-[var(--border,#e5e7eb)]"
      style={{ height: resolvedHeight }}
    >
      {location ? (
        <LiveTrackingMapInner
          latitude={location.latitude}
          longitude={location.longitude}
          accent={accent}
        />
      ) : (
        <MapMessage icon={<MapPin size={18} />} text={waitingLabel} />
      )}
    </div>
  );
}
