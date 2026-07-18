"use client";

import { useEffect, useMemo, useState } from "react";
import { haversineKm, type LatLng } from "@/lib/nepalGeo";
import { fetchRoute, type RouteResult } from "@/lib/routing";

export type LiveRouteLocation = {
  latitude: number;
  longitude: number;
  speed?: number | null;
  updatedAt?: string;
};

export type LiveRouteProgress = {
  geometry: LatLng[];
  approximate: boolean;
  remainingDistanceKm: number | null;
  remainingDistanceLabel: string;
  etaMinutes: number | null;
  etaLabel: string;
  arrivalLabel: string;
};

const DEFAULT_SPEED_KPH = 30;
const MIN_ETA_SPEED_KPH = 12;
const MAX_ETA_SPEED_KPH = 90;
const MAX_ROUTE_SAMPLES = 800;

const ROUTE_REFRESH_DISTANCE_KM = 0.25;

export function formatDistance(distanceKm: number | null): string {
  if (distanceKm === null || !Number.isFinite(distanceKm)) return "--";
  if (distanceKm < 1) return `${Math.max(0, Math.round(distanceKm * 1000))} m`;
  return `${distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)} km`;
}

function formatEta(minutes: number | null): string {
  if (minutes === null) return "--";
  if (minutes <= 0) return "Arriving now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function buildRemainingDistances(geometry: LatLng[]): number[] {
  const remainingByIndex = new Array<number>(geometry.length).fill(0);
  for (let index = geometry.length - 2; index >= 0; index -= 1) {
    remainingByIndex[index] =
      remainingByIndex[index + 1] +
      haversineKm(geometry[index], geometry[index + 1]);
  }
  return remainingByIndex;
}

function remainingAlongRoute(
  driver: LatLng,
  delivery: LatLng,
  geometry: LatLng[],
  remainingByIndex: number[],
): number {
  if (geometry.length < 2) return haversineKm(driver, delivery);

  const sampleStep = Math.max(
    1,
    Math.ceil((geometry.length - 1) / MAX_ROUTE_SAMPLES),
  );
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  const consider = (index: number) => {
    const distance = haversineKm(driver, geometry[index]);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  };

  for (let index = 0; index < geometry.length; index += sampleStep) {
    consider(index);
  }
  consider(geometry.length - 1);

  return nearestDistance + remainingByIndex[nearestIndex];
}

export function useLiveRoute(
  delivery: LatLng | null,
  location: LiveRouteLocation | null,
): LiveRouteProgress {
  const deliveryLat = delivery?.[0] ?? null;
  const deliveryLng = delivery?.[1] ?? null;
  const driverLat = location?.latitude ?? null;
  const driverLng = location?.longitude ?? null;

  // Throttled routing origin: the driver position we last fetched a route from.
  // It only advances once the driver has moved ROUTE_REFRESH_DISTANCE_KM, so the
  // road-following line stays anchored to the driver without re-routing on every tick.
  const [origin, setOrigin] = useState<LatLng | null>(null);
  useEffect(() => {
    if (driverLat === null || driverLng === null) {
      setOrigin(null);
      return;
    }
    setOrigin((prev) => {
      if (!prev) return [driverLat, driverLng];
      const moved = haversineKm(prev, [driverLat, driverLng]);
      return moved >= ROUTE_REFRESH_DISTANCE_KM ? [driverLat, driverLng] : prev;
    });
  }, [driverLat, driverLng]);

  const originLat = origin?.[0] ?? null;
  const originLng = origin?.[1] ?? null;
  const routeKey =
    originLat !== null &&
    originLng !== null &&
    deliveryLat !== null &&
    deliveryLng !== null
      ? `${originLat},${originLng}->${deliveryLat},${deliveryLng}`
      : "";
  const [route, setRoute] = useState<
    (RouteResult & { key: string }) | null
  >(null);

  useEffect(() => {
    if (!routeKey || originLat === null || originLng === null || deliveryLat === null || deliveryLng === null) {
      return;
    }

    const controller = new AbortController();
    let active = true;
    const routeOrigin: LatLng = [originLat, originLng];
    const routeDelivery: LatLng = [deliveryLat, deliveryLng];

    fetchRoute(routeOrigin, routeDelivery, controller.signal)
      .then((result) => {
        if (active) setRoute({ ...result, key: routeKey });
      })
      .catch(() => {
        // Abort is expected when the selected shipment changes.
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [deliveryLat, deliveryLng, originLat, originLng, routeKey]);

  const currentRoute = route?.key === routeKey ? route : null;
  const geometry = useMemo<LatLng[]>(() => {
    if (currentRoute?.geometry.length) return currentRoute.geometry;
    if (origin && delivery) return [origin, delivery];
    return [];
  }, [currentRoute, delivery, origin]);

  const remainingByIndex = useMemo(
    () => buildRemainingDistances(geometry),
    [geometry],
  );
  const remainingDistanceKm = useMemo(() => {
    if (!location || !delivery) return null;
    return remainingAlongRoute(
      [location.latitude, location.longitude],
      delivery,
      geometry,
      remainingByIndex,
    );
  }, [delivery, geometry, location, remainingByIndex]);

  const gpsSpeedKph =
    typeof location?.speed === "number" &&
    Number.isFinite(location.speed) &&
    location.speed >= 1
      ? location.speed * 3.6
      : DEFAULT_SPEED_KPH;
  const effectiveSpeedKph = Math.min(
    MAX_ETA_SPEED_KPH,
    Math.max(MIN_ETA_SPEED_KPH, gpsSpeedKph),
  );
  const etaMinutes =
    remainingDistanceKm === null
      ? null
      : remainingDistanceKm <= 0.05
        ? 0
        : Math.max(
            1,
            Math.ceil((remainingDistanceKm / effectiveSpeedKph) * 60),
          );
  const locationTimestamp = location?.updatedAt
    ? new Date(location.updatedAt).getTime()
    : Number.NaN;
  const arrivalLabel =
    etaMinutes !== null && Number.isFinite(locationTimestamp)
      ? new Date(locationTimestamp + etaMinutes * 60_000).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "";

  return {
    geometry,
    approximate: currentRoute?.approximate ?? true,
    remainingDistanceKm,
    remainingDistanceLabel: formatDistance(remainingDistanceKm),
    etaMinutes,
    etaLabel: formatEta(etaMinutes),
    arrivalLabel,
  };
}
