"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import type { Shipment } from "@/lib/api/shipment.api";
import type { TrackingError } from "@/lib/api/tracking.api";

export interface DriverFix {
  latitude: number;
  longitude: number;
  speed: number | null;
  updatedAt: string;
}

const TERMINAL_STATUSES = ["delivered", "cancelled"];
const TERMINAL_STAGES = ["delivered", "failed", "returned"];
// Live GPS may only be shared once the driver has confirmed pickup.
const PICKUP_CONFIRMED_STAGES = ["picked-up", "in-transit", "out-for-delivery"];

export function isPickupConfirmed(shipment: Shipment): boolean {
  return (
    !!shipment.driverStage &&
    PICKUP_CONFIRMED_STAGES.includes(shipment.driverStage)
  );
}

export function isTrackable(shipment: Shipment): boolean {
  if (TERMINAL_STATUSES.includes(shipment.status)) return false;
  if (shipment.driverStage && TERMINAL_STAGES.includes(shipment.driverStage)) {
    return false;
  }
  return isPickupConfirmed(shipment);
}

interface Result {
  isTracking: boolean;
  trackable: boolean;
  error: string | null;
  lastFix: DriverFix | null;
  start: () => void;
  stop: () => void;
}

export function useDriverTracking(
  token: string,
  shipment: Shipment,
): Result {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFix, setLastFix] = useState<DriverFix | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const isTrackingRef = useRef(false);
  const shipmentId = shipment.id;

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    const wasSharing = watchIdRef.current !== null || isTrackingRef.current;
    clearWatch();
    if (token) {
      const socket = getSocket(token);
      if (wasSharing) {
        socket.emit("driver-location-stop", { shipmentId });
      }
      socket.emit("leave-shipment-room", { shipmentId });
    }
    setLastFix(null);
    setIsTracking(false);
  }, [token, shipmentId, clearWatch]);

  const start = useCallback(() => {
    setError(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported on this device.");
      return;
    }

    const socket = getSocket(token);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        socket.emit("driver-location-update", {
          shipmentId,
          latitude,
          longitude,
          accuracy: accuracy ?? null,
          speed: speed ?? null,
          heading: heading ?? null,
        });
        setLastFix({
          latitude,
          longitude,
          speed: speed ?? null,
          updatedAt: new Date(pos.timestamp).toISOString(),
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            "Location permission denied. Enable location access to start tracking.",
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Location unavailable. Check your GPS or connection.");
        } else {
          setError("Could not get your location.");
        }
        stop();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );

    watchIdRef.current = watchId;
    setIsTracking(true);
  }, [token, shipmentId, stop]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    const onError = (err: TrackingError) => {
      setError(err?.message ?? "Tracking error");
    };
    socket.on("tracking-error", onError);
    return () => {
      socket.off("tracking-error", onError);
    };
  }, [token]);

  useEffect(() => {
    if (isTracking && !isTrackable(shipment)) {
      stop();
    }
  }, [shipment, isTracking, stop]);

  useEffect(() => {
    return () => {
      const wasSharing = watchIdRef.current !== null || isTrackingRef.current;
      clearWatch();
      if (wasSharing && token) {
        getSocket(token).emit("driver-location-stop", { shipmentId });
      }
    };
  }, [clearWatch, shipmentId, token]);

  return {
    isTracking,
    trackable: isTrackable(shipment),
    error,
    lastFix,
    start,
    stop,
  };
}
