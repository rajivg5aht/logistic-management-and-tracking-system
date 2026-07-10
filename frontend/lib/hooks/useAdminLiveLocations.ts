"use client";

import { useEffect, useMemo, useState } from "react";
import { getSocket } from "@/lib/socket";
import type { Shipment } from "@/lib/api/shipment.api";
import type {
  LiveLocation,
  TrackingError,
  TrackingStatusUpdate,
} from "@/lib/api/tracking.api";

const TERMINAL_STATUSES = ["delivered", "cancelled"];
const TERMINAL_STAGES = ["delivered", "failed", "returned"];

export function isAdminTrackableShipment(shipment: Shipment): boolean {
  if (!shipment.assignedDriverId) return false;
  if (TERMINAL_STATUSES.includes(shipment.status)) return false;
  if (shipment.driverStage && TERMINAL_STAGES.includes(shipment.driverStage)) {
    return false;
  }
  return true;
}

export function useAdminLiveLocations(
  token: string,
  shipments: Shipment[],
): {
  locationsByShipmentId: Record<string, LiveLocation>;
  error: string | null;
} {
  const [locationsByShipmentId, setLocationsByShipmentId] = useState<
    Record<string, LiveLocation>
  >({});
  const [error, setError] = useState<string | null>(null);

  const roomIds = useMemo(
    () =>
      shipments
        .filter(isAdminTrackableShipment)
        .map((shipment) => shipment.id)
        .sort(),
    [shipments],
  );
  const roomKey = roomIds.join("|");

  useEffect(() => {
    const activeIds = new Set(roomIds);
    setLocationsByShipmentId((previous) => {
      const next: Record<string, LiveLocation> = {};
      for (const id of activeIds) {
        if (previous[id]) next[id] = previous[id];
      }
      return next;
    });
  }, [roomIds]);

  useEffect(() => {
    if (!token || roomIds.length === 0) return;

    const socket = getSocket(token);
    const activeIds = new Set(roomIds);

    const joinAll = () => {
      for (const shipmentId of roomIds) {
        socket.emit("join-shipment-room", { shipmentId });
      }
    };

    const onLocationUpdated = (location: LiveLocation) => {
      if (!activeIds.has(location.shipmentId)) return;
      if (!location.isLive) {
        setLocationsByShipmentId((previous) => {
          const next = { ...previous };
          delete next[location.shipmentId];
          return next;
        });
        return;
      }
      setLocationsByShipmentId((previous) => ({
        ...previous,
        [location.shipmentId]: location,
      }));
      setError(null);
    };

    const onLocationStopped = (status: TrackingStatusUpdate) => {
      if (!activeIds.has(status.shipmentId)) return;
      setLocationsByShipmentId((previous) => {
        const next = { ...previous };
        delete next[status.shipmentId];
        return next;
      });
      setError(null);
    };

    const onTrackingError = (trackingError: TrackingError) => {
      setError(trackingError?.message ?? "Tracking error");
    };

    socket.on("shipment-location-updated", onLocationUpdated);
    socket.on("shipment-location-stopped", onLocationStopped);
    socket.on("tracking-error", onTrackingError);
    socket.on("connect", joinAll);
    if (socket.connected) joinAll();

    return () => {
      for (const shipmentId of roomIds) {
        socket.emit("leave-shipment-room", { shipmentId });
      }
      socket.off("shipment-location-updated", onLocationUpdated);
      socket.off("shipment-location-stopped", onLocationStopped);
      socket.off("tracking-error", onTrackingError);
      socket.off("connect", joinAll);
    };
  }, [token, roomKey, roomIds]);

  return { locationsByShipmentId, error };
}
