"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Clock3,
  CreditCard,
  Gauge,
  LocateFixed,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Phone,
  Route as RouteIcon,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  Weight,
} from "lucide-react";
import {
  adminGetShipments,
  DRIVER_STAGE_LABELS,
  getShipmentDisplayStatus,
  type Shipment,
} from "@/lib/api/shipment.api";
import type { LiveLocation } from "@/lib/api/tracking.api";
import { useAdminLiveLocations } from "@/lib/hooks/useAdminLiveLocations";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useLiveRoute } from "@/lib/hooks/useLiveRoute";
import { getDistrictCoords } from "@/lib/nepalGeo";
import { formatNPR } from "@/lib/pricing";
import FleetTrackingMap, {
  type FleetMapMarker,
  type FleetMapRoute,
} from "@/components/tracking/FleetTrackingMap";

const NAVY = "var(--accent-strong)";
const BRAND = "var(--accent)";
const STALE_AFTER_MINUTES = 10;

type FilterKey = "active" | "gps" | "attention";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "active", label: "Active orders" },
  { key: "gps", label: "Live GPS" },
  { key: "attention", label: "Needs attention" },
];

const SERVICE_LABELS: Record<string, string> = {
  standard: "Standard",
  express: "Express",
  overnight: "Overnight",
};

const PARCEL_LABELS: Record<string, string> = {
  standard: "Standard",
  fragile: "Fragile",
  pallet: "Pallet",
};

function isActiveShipment(shipment: Shipment): boolean {
  return shipment.status !== "delivered" && shipment.status !== "cancelled";
}

function addressLine(address: Shipment["pickup"]): string {
  return [address.streetAddress, address.city, address.district]
    .filter(Boolean)
    .join(", ") || "-";
}

function shortAddress(address: Shipment["pickup"]): string {
  return [address.city, address.district].filter(Boolean).join(", ") || "-";
}

function formatAgo(dateValue?: string | null): string {
  if (!dateValue) return "No GPS";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(dateValue).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function minutesSince(dateValue?: string | null): number | null {
  if (!dateValue) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(dateValue).getTime()) / 60_000));
}

function speedKph(speed: number | null | undefined): string {
  if (typeof speed !== "number" || !Number.isFinite(speed) || speed < 0) return "--";
  return `${Math.round(speed * 3.6)} km/h`;
}

function dimensionsLabel(shipment: Shipment): string {
  const { length, width, height } = shipment.package.dimensions;
  return length && width && height ? `${length} x ${width} x ${height} cm` : "-";
}

function locationForShipment(
  shipmentId: string,
  liveLocations: Record<string, LiveLocation>,
): LiveLocation | null {
  return liveLocations[shipmentId] ?? null;
}

function needsAttention(shipment: Shipment, location: LiveLocation | null): boolean {
  if (!shipment.assignedDriverId) return true;
  if (!location) return true;
  const age = minutesSince(location.updatedAt);
  return age !== null && age >= STALE_AFTER_MINUTES;
}

function statusTone(shipment: Shipment, location: LiveLocation | null): string {
  if (needsAttention(shipment, location)) return "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]";
  if (shipment.status === "in-transit") return "border-[var(--info-border)] bg-[var(--info-soft)] text-[var(--info)]";
  return "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]";
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-xl font-black" style={{ color: NAVY }}>{value}</p>
    </div>
  );
}

function MiniTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {icon}
        {label}
      </p>
      <div className="mt-1 break-words text-sm font-bold text-[var(--text)]">{value}</div>
    </div>
  );
}

function RouteBlock({ shipment }: { shipment: Shipment }) {
  return (
    <div className="relative pl-6">
      <span className="absolute bottom-3 left-[6px] top-3 w-px bg-[var(--border)]" />
      <div className="relative pb-5">
        <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-[var(--success)] ring-4 ring-[var(--success)]/15" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Pickup</p>
        <p className="mt-0.5 text-sm font-bold text-[var(--text)]">{shipment.pickup.fullName || "Sender"}</p>
        <p className="text-xs font-medium text-[var(--text-soft)]">{addressLine(shipment.pickup)}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><Phone size={12} />{shipment.pickup.phoneNumber || "-"}</p>
      </div>
      <div className="relative">
        <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-[var(--accent-hover)] ring-4 ring-[var(--accent-hover)]/15" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Delivery</p>
        <p className="mt-0.5 text-sm font-bold text-[var(--text)]">{shipment.delivery.recipientName || "Recipient"}</p>
        <p className="text-xs font-medium text-[var(--text-soft)]">{addressLine(shipment.delivery)}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><Phone size={12} />{shipment.delivery.phoneNumber || "-"}</p>
      </div>
    </div>
  );
}

function SelectedDetails({ shipment, location }: { shipment: Shipment | null; location: LiveLocation | null }) {
  if (!shipment) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-center">
        <Package size={22} className="mx-auto text-[var(--text-muted)]" />
        <p className="mt-2 text-sm font-bold text-[var(--text)]">No active order selected</p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">New assigned orders will appear here.</p>
      </div>
    );
  }

  const gpsAge = minutesSince(location?.updatedAt);
  const stale = gpsAge !== null && gpsAge >= STALE_AFTER_MINUTES;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Selected Order</p>
            <h2 className="mt-0.5 text-xl font-black" style={{ color: NAVY }}>#{shipment.trackingId}</h2>
          </div>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${statusTone(shipment, location)}`}>
            {getShipmentDisplayStatus(shipment)}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniTile icon={<Navigation size={13} />} label="GPS" value={location ? (stale ? `Stale ${formatAgo(location.updatedAt)}` : "Live") : "Not shared"} />
          <MiniTile icon={<Gauge size={13} />} label="Speed" value={speedKph(location?.speed)} />
          <MiniTile icon={<Truck size={13} />} label="Driver" value={shipment.assignedDriver || "Unassigned"} />
          <MiniTile icon={<MapPin size={13} />} label="Vehicle" value={shipment.assignedVehicle || "-"} />
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          <RouteIcon size={14} className="text-[var(--accent-strong)]" />Route
        </h3>
        <RouteBlock shipment={shipment} />
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          <Package size={14} className="text-[var(--accent-strong)]" />Parcel Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <MiniTile icon={<Boxes size={13} />} label="Type" value={PARCEL_LABELS[shipment.package.parcelType] ?? shipment.package.parcelType} />
          <MiniTile icon={<Weight size={13} />} label="Weight" value={shipment.package.weight ? `${shipment.package.weight} kg` : "-"} />
          <MiniTile icon={<Boxes size={13} />} label="Qty" value={shipment.package.quantity} />
          <MiniTile icon={<Package size={13} />} label="Size" value={dimensionsLabel(shipment)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--info-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--info)]"><Truck size={12} />{SERVICE_LABELS[shipment.service] ?? shipment.service}</span>
          {shipment.insurance && <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--success-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--success)]"><ShieldCheck size={12} />Insured</span>}
          {shipment.specialHandling && <span className="inline-flex rounded-lg bg-[var(--warning-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--warning)]">Special handling</span>}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]"><CreditCard size={14} className="text-[var(--accent-strong)]" />Payment</h3>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-soft)] p-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount</p>
            <p className="text-lg font-black" style={{ color: NAVY }}>{formatNPR(shipment.amount)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-md bg-white px-2.5 py-1 text-[11px] font-bold uppercase text-[var(--text-soft)]">{shipment.paymentMethod}</span>
            <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase ${shipment.paymentStatus === "paid" ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--warning-soft)] text-[var(--warning)]"}`}>{shipment.paymentStatus}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function OrderListItem({ shipment, location, selected, onSelect }: { shipment: Shipment; location: LiveLocation | null; selected: boolean; onSelect: () => void }) {
  const stale = needsAttention(shipment, location);
  const stage = shipment.driverStage ? DRIVER_STAGE_LABELS[shipment.driverStage] ?? shipment.driverStage : getShipmentDisplayStatus(shipment);

  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={onSelect}
      className={`w-full rounded-xl border bg-[var(--surface)] p-3 text-left transition-all hover:border-[var(--accent)] hover:shadow-sm ${selected ? "border-[var(--accent)] shadow-sm" : "border-[var(--border)]"}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stale ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"}`}>
          {stale ? <AlertTriangle size={18} /> : <Truck size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[var(--text)]">#{shipment.trackingId}</p>
              <p className="truncate text-[11px] font-semibold text-[var(--text-muted)]">{shipment.assignedDriver || "No driver assigned"}</p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-black ${stale ? "text-[var(--danger)]" : "text-[var(--accent-strong)]"}`}>{location ? speedKph(location.speed) : "--"}</p>
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{location ? (stale ? "stale" : "live") : "no gps"}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[var(--surface-soft)] p-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Destination</p>
              <p className="mt-0.5 truncate text-xs font-bold text-[var(--text)]">{shortAddress(shipment.delivery)}</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Last GPS</p>
              <p className="mt-0.5 truncate text-xs font-bold text-[var(--text)]">{formatAgo(location?.updatedAt)}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="truncate text-[11px] font-semibold text-[var(--text-muted)]">{stage}</span>
            <span className="truncate text-[11px] font-bold text-[var(--text)]">{shipment.package.quantity} parcel{shipment.package.quantity === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AdminLiveMap({ token }: { token: string }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("active");
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

  const loadShipments = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      if (silent) setRefreshing(true);
      const result = await adminGetShipments(token, 1, 500);
      setShipments(result.data);
      setError(null);
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Failed to load live map orders.");
    } finally {
      if (!silent) setLoading(false);
      if (silent) setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    void loadShipments();
  }, [loadShipments]);

  useAutoRefresh(() => loadShipments(true), { intervalMs: 12_000 });

  const activeShipments = useMemo(() => shipments.filter(isActiveShipment), [shipments]);
  const { locationsByShipmentId, error: trackingError } = useAdminLiveLocations(token, activeShipments);

  const enriched = useMemo(
    () => activeShipments.map((shipment) => ({ shipment, location: locationForShipment(shipment.id, locationsByShipmentId) })),
    [activeShipments, locationsByShipmentId],
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enriched.filter(({ shipment, location }) => {
      if (filter === "gps" && !location) return false;
      if (filter === "attention" && !needsAttention(shipment, location)) return false;
      if (!query) return true;
      const haystack = [
        shipment.trackingId,
        shipment.assignedDriver,
        shipment.assignedVehicle,
        shipment.delivery.recipientName,
        shipment.delivery.city,
        shipment.delivery.district,
        shipment.pickup.fullName,
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [enriched, filter, search]);

  const selectedEntry = useMemo(() => {
    const explicit = filteredOrders.find(({ shipment }) => shipment.id === selectedShipmentId);
    if (explicit) return explicit;
    return filteredOrders.find(({ location }) => Boolean(location)) ?? filteredOrders[0] ?? null;
  }, [filteredOrders, selectedShipmentId]);

  const selectedShipment = selectedEntry?.shipment ?? null;
  const selectedDelivery = getDistrictCoords(selectedShipment?.delivery.district ?? "");
  const selectedRouteProgress = useLiveRoute(
    selectedDelivery,
    selectedEntry?.location ?? null,
  );
  const selectedMapRoute = useMemo<FleetMapRoute | null>(() => {
    if (!selectedShipment) return null;
    return {
      shipmentId: selectedShipment.id,
      delivery: selectedDelivery,
      geometry: selectedRouteProgress.geometry,
      approximate: selectedRouteProgress.approximate,
    };
  }, [
    selectedDelivery,
    selectedRouteProgress.approximate,
    selectedRouteProgress.geometry,
    selectedShipment,
  ]);

  const mapMarkers = useMemo<FleetMapMarker[]>(
    () => enriched.flatMap(({ shipment, location }) => {
      if (!location) return [];
      return [{
        shipmentId: shipment.id,
        trackingId: shipment.trackingId,
        latitude: location.latitude,
        longitude: location.longitude,
        driverName: shipment.assignedDriver || "Assigned driver",
        statusLabel: getShipmentDisplayStatus(shipment),
        isSelected: selectedEntry?.shipment.id === shipment.id,
        isStale: needsAttention(shipment, location),
      }];
    }),
    [enriched, selectedEntry],
  );

  const gpsCount = enriched.filter(({ location }) => Boolean(location)).length;
  const attentionCount = enriched.filter(({ shipment, location }) => needsAttention(shipment, location)).length;
  const assignedCount = activeShipments.filter((shipment) => Boolean(shipment.assignedDriverId)).length;
  const filterCounts: Record<FilterKey, number> = { active: activeShipments.length, gps: gpsCount, attention: attentionCount };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--accent-strong)]">Live Operations</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight" style={{ color: NAVY }}>Live Map</h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">Track active GPS orders, driver position, and parcel details.</p>
        </div>
      </div>

      {(error || trackingError) && (
        <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">{error || trackingError}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={<Package size={15} />} label="Active Orders" value={activeShipments.length} />
        <StatTile icon={<Truck size={15} />} label="Assigned" value={assignedCount} />
        <StatTile icon={<LocateFixed size={15} />} label="GPS Pins" value={gpsCount} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]" style={{ minHeight: "min(720px, calc(100vh - 210px))" }}>
        <section className="relative isolate z-0 min-h-[560px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <FleetTrackingMap
            markers={mapMarkers}
            route={selectedMapRoute}
            selectedShipmentId={selectedEntry?.shipment.id}
            onSelect={setSelectedShipmentId}
          />

          <div className="absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                suppressHydrationWarning
                onClick={() => setFilter(item.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black shadow-sm backdrop-blur transition-colors ${filter === item.key ? "border-transparent text-[var(--text-on-accent)]" : "border-[var(--border)] bg-white/92 text-[var(--text)] hover:bg-white"}`}
                style={filter === item.key ? { backgroundColor: BRAND } : undefined}
              >
                {item.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === item.key ? "bg-black/5 text-[var(--accent-strong)]" : "bg-[var(--surface-soft)] text-[var(--text-muted)]"}`}>{filterCounts[item.key]}</span>
              </button>
            ))}
          </div>

          {selectedEntry?.location && selectedRouteProgress.remainingDistanceKm !== null && (
            <div
              aria-live="polite"
              className="absolute bottom-4 right-4 z-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--border-strong)] bg-white/94 shadow-lg backdrop-blur"
            >
              <div className="min-w-28 px-3 py-2.5">
                <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                  <RouteIcon size={11} /> Remaining
                </p>
                <p className="mt-0.5 text-sm font-black" style={{ color: NAVY }}>
                  {selectedRouteProgress.remainingDistanceLabel}
                </p>
              </div>
              <div className="min-w-28 border-l border-[var(--border)] px-3 py-2.5">
                <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                  <Clock3 size={11} /> ETA
                </p>
                <p className="mt-0.5 text-sm font-black" style={{ color: NAVY }}>
                  {selectedRouteProgress.etaLabel}
                </p>
                {selectedRouteProgress.arrivalLabel && selectedRouteProgress.etaMinutes !== 0 && (
                  <p className="text-[9px] font-bold text-[var(--text-muted)]">
                    by {selectedRouteProgress.arrivalLabel}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 rounded-xl border border-[var(--border)] bg-white/92 p-2 shadow-sm backdrop-blur">
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-[var(--accent-strong)]"><span className="h-2 w-2 rounded-full bg-[var(--accent)]" />Live</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-[var(--warning)]"><span className="h-2 w-2 rounded-full bg-[var(--warning)]" />Stale</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-[var(--danger)]"><span className="h-2 w-2 rounded-full bg-[var(--danger)]" />Missing</span>
          </div>

          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/55 backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[var(--text)] shadow-sm"><Loader2 size={16} className="animate-spin text-[var(--accent-strong)]" />Loading orders</div>
            </div>
          )}
        </section>

        <aside className="flex min-h-[560px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-soft)] shadow-sm">
          <div className="border-b border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black" style={{ color: NAVY }}>Active Orders</h2>
                <p className="text-xs font-semibold text-[var(--text-muted)]">{filteredOrders.length} matching orders</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--accent-strong)]"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" /></span>Live</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input suppressHydrationWarning value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, driver, parcel..." className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm font-medium text-[var(--text)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"><SlidersHorizontal size={16} /></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <SelectedDetails shipment={selectedEntry?.shipment ?? null} location={selectedEntry?.location ?? null} />
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">Order Feed</h3>
                <span className="text-[11px] font-bold text-[var(--text-muted)]">Updated {refreshing ? "now" : "automatically"}</span>
              </div>
              {filteredOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-center">
                  <Package size={20} className="mx-auto text-[var(--text-muted)]" />
                  <p className="mt-2 text-sm font-bold text-[var(--text)]">No orders found</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">Try another filter or search term.</p>
                </div>
              ) : (
                filteredOrders.map(({ shipment, location }) => (
                  <OrderListItem
                    key={shipment.id}
                    shipment={shipment}
                    location={location}
                    selected={selectedEntry?.shipment.id === shipment.id}
                    onSelect={() => setSelectedShipmentId(shipment.id)}
                  />
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
