"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import {
  getShipmentLocation,
  type LiveLocation,
  type TrackingError,
  type TrackingStatusUpdate,
} from "@/lib/api/tracking.api";

interface Result {
  location: LiveLocation | null;
  error: string | null;
}

export function useShipmentLiveLocation(
  token: string | undefined,
  shipmentId: string | undefined,
  enabled: boolean = true,
): Result {
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !token || !shipmentId) return;

    let active = true;
    setLocation(null);
    setError(null);

    getShipmentLocation(token, shipmentId)
      .then((loc) => {
        if (active && loc?.isLive) setLocation(loc);
      })
      .catch(() => {
      });

    const socket = getSocket(token);

    const onUpdate = (loc: LiveLocation) => {
      if (loc.shipmentId !== shipmentId) return;
      setLocation(loc.isLive ? loc : null);
    };
    const onStopped = (status: TrackingStatusUpdate) => {
      if (status.shipmentId === shipmentId) setLocation(null);
    };
    const onError = (err: TrackingError) => {
      setError(err?.message ?? "Tracking error");
    };
    const join = () => socket.emit("join-shipment-room", { shipmentId });

    socket.on("shipment-location-updated", onUpdate);
    socket.on("shipment-location-stopped", onStopped);
    socket.on("tracking-error", onError);
    socket.on("connect", join);
    if (socket.connected) join();

    return () => {
      active = false;
      socket.emit("leave-shipment-room", { shipmentId });
      socket.off("shipment-location-updated", onUpdate);
      socket.off("shipment-location-stopped", onStopped);
      socket.off("tracking-error", onError);
      socket.off("connect", join);
    };
  }, [token, shipmentId, enabled]);

  return { location, error };
}
