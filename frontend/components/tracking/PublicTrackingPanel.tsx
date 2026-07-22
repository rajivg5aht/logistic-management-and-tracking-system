"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Package, Search } from "lucide-react";
import { trackByCode, type Shipment } from "@/lib/api/shipment.api";
import { ApiError } from "@/lib/api/api-client";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import ShipmentTrackingView from "@/components/tracking/ShipmentTrackingView";

export default function PublicTrackingPanel({
  initialTrackingId = "",
}: {
  initialTrackingId?: string;
}) {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [activeTrackingId, setActiveTrackingId] = useState(initialTrackingId);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(Boolean(initialTrackingId));
  const [error, setError] = useState<string | null>(null);

  const loadShipment = useCallback(
    async (silent = false) => {
      const normalized = activeTrackingId.trim().toUpperCase();
      if (!normalized) {
        setShipment(null);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        if (!silent) setLoading(true);
        const found = await trackByCode(normalized);
        setShipment(found);
        setError(null);
      } catch (loadError) {
        if (!silent) {
          setShipment(null);
          setError(
            loadError instanceof ApiError && loadError.status === 404
              ? "No shipment found with this tracking ID."
              : loadError instanceof Error
                ? loadError.message
                : "Unable to load tracking details.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [activeTrackingId],
  );

  useEffect(() => {
    loadShipment();
  }, [loadShipment]);

  useAutoRefresh(() => loadShipment(true), {
    intervalMs: 10_000,
    enabled: Boolean(activeTrackingId),
  });

  const handleTrack = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = trackingId.trim().toUpperCase();
    if (!normalized) {
      setError("Enter a tracking ID to continue.");
      return;
    }
    setActiveTrackingId(normalized);
    router.replace(`/track?trackingId=${encodeURIComponent(normalized)}`);
    if (normalized === activeTrackingId.trim().toUpperCase()) {
      void loadShipment();
    }
  };

  const liveLocation = shipment?.currentLocation ?? null;

  return (
    <div className="space-y-6">
      <form onSubmit={handleTrack} className="relative mx-auto w-full max-w-xl">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          value={trackingId}
          onChange={(event) => setTrackingId(event.target.value)}
          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-28 text-sm font-semibold uppercase text-[var(--text)] shadow-sm outline-none focus:border-[var(--accent)]"
          placeholder="Enter tracking ID"
          autoComplete="off"
          suppressHydrationWarning
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 flex h-9 -translate-y-1/2 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-bold text-[var(--text-on-accent)]"
          suppressHydrationWarning
        >
          Track Now
        </button>
      </form>

      {loading ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-[var(--border)] bg-white">
          <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : error ? (
        <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-5 text-sm font-semibold text-[var(--danger)]">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          {error}
        </div>
      ) : !shipment ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-[var(--border)] bg-white p-10 text-center">
          <Package size={32} className="mx-auto text-[var(--text-muted)]" />
          <h1 className="mt-3 text-lg font-extrabold text-[var(--text)]">
            Track your shipment
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Enter a tracking ID to see its latest status and location.
          </p>
        </div>
      ) : (
        <ShipmentTrackingView shipment={shipment} liveLocation={liveLocation} />
      )}
    </div>
  );
}
