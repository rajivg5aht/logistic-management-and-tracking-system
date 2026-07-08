"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import type { Shipment } from "@/lib/api/shipment.api";
import type { TrackingError } from "@/lib/api/tracking.api";

export interface DriverFix {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

// A delivery is trackable until it reaches a terminal status/stage. Mirrors the
// backend guard in TrackingService.saveDriverLocation.
const TERMINAL_STATUSES = ["delivered", "cancelled"];
const TERMINAL_STAGES = ["delivered", "failed", "returned"];

export function isTrackable(shipment: Shipment): boolean {
  if (TERMINAL_STATUSES.includes(shipment.status)) return false;
  if (shipment.driverStage && TERMINAL_STAGES.includes(shipment.driverStage)) {
    return false;
  }
  return true;
}

interface Result {
  isTracking: boolean;
  trackable: boolean;
  error: string | null;
  lastFix: DriverFix | null;
  start: () => void;
  stop: () => void;
}

/**
 * Drives the assigned driver's location broadcast for one shipment.
 *
 * `start()` opens `navigator.geolocation.watchPosition` and emits a
 * `driver-location-update` on every fix; `stop()` clears the watch and leaves
 * the room. Permission/GPS failures surface via `error`. Tracking auto-stops
 * when the delivery reaches a terminal state and when the component unmounts.
 */
export function useDriverTracking(
  token: string,
  shipment: Shipment,
): Result {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFix, setLastFix] = useState<DriverFix | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const shipmentId = shipment.id;

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearWatch();
    if (token) {
      getSocket(token).emit("leave-shipment-room", { shipmentId });
    }
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
        clearWatch();
        setIsTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );

    watchIdRef.current = watchId;
    setIsTracking(true);
  }, [token, shipmentId, clearWatch]);

  // Surface server-side rejections (e.g. shipment no longer active).
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

  // Auto-stop once the delivery is completed/cancelled/failed.
  useEffect(() => {
    if (isTracking && !isTrackable(shipment)) {
      stop();
    }
  }, [shipment, isTracking, stop]);

  // Ensure the watch is released if the component unmounts mid-tracking.
  useEffect(() => clearWatch, [clearWatch]);

  return {
    isTracking,
    trackable: isTrackable(shipment),
    error,
    lastFix,
    start,
    stop,
  };
}
