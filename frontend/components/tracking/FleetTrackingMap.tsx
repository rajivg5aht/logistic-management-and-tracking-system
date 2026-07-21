"use client";

import dynamic from "next/dynamic";
import { Loader2, MapPin } from "lucide-react";
import type {
  FleetMapMarker,
  FleetMapRoute,
} from "./FleetTrackingMapInner";

export type {
  FleetMapMarker,
  FleetMapRoute,
} from "./FleetTrackingMapInner";
type Props = {
  markers: FleetMapMarker[];
  route?: FleetMapRoute | null;
  selectedShipmentId?: string | null;
  onSelect: (shipmentId: string) => void;
  height?: number | string;
};

const FleetTrackingMapInner = dynamic(() => import("./FleetTrackingMapInner"), {
  ssr: false,
  loading: () => (
    <MapMessage
      icon={<Loader2 size={18} className="animate-spin" />}
      text="Loading live map"
    />
  ),
});

function MapMessage({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--surface-soft,var(--surface-soft))] text-center">
      <span className="text-[var(--text-muted,var(--text-muted))]">{icon}</span>
      <p className="text-xs font-semibold text-[var(--text-muted,var(--text-muted))]">
        {text}
      </p>
    </div>
  );
}

export default function FleetTrackingMap({
  markers,
  route = null,
  selectedShipmentId,
  onSelect,
  height = "100%",
}: Props) {
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[var(--surface-soft)]"
      style={{ height: resolvedHeight }}
    >
      <FleetTrackingMapInner
        markers={markers}
        route={route}
        selectedShipmentId={selectedShipmentId}
        onSelect={onSelect}
      />

      {markers.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] rounded-xl border border-[var(--border)] bg-white/92 p-4 text-center shadow-sm backdrop-blur">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <MapPin size={18} />
          </div>
          <p className="mt-2 text-sm font-bold text-[var(--text)]">
            No live GPS pins yet
          </p>
          <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
            Assigned drivers appear here after sharing location.
          </p>
        </div>
      )}
    </div>
  );
}
