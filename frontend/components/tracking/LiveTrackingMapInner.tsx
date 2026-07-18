"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import {
  NEPAL_CENTER,
  NEPAL_OVERVIEW_ZOOM,
  type LatLng,
} from "@/lib/nepalGeo";

type Props = {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  delivery: LatLng | null;
  geometry: LatLng[];
  approximate: boolean;
  accent?: string;
};

function BoundsController({
  location,
  delivery,
}: Pick<Props, "location" | "delivery">) {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    const points: LatLng[] = [];
    if (delivery) points.push(delivery);
    if (location) points.push([location.latitude, location.longitude]);
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 14, { animate: initialized.current });
      initialized.current = true;
      return;
    }

    const bounds = L.latLngBounds(points);
    const allVisible = points.every((point) => map.getBounds().contains(point));
    if (!initialized.current || !allVisible) {
      map.fitBounds(bounds, {
        animate: initialized.current,
        maxZoom: 13,
        padding: [48, 48],
      });
    }
    initialized.current = true;
  }, [delivery, location, map]);

  return null;
}

function makeEndpointIcon(label: string, color: string, textColor: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:34px;height:44px;">
        <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 8px 12px rgba(15,23,42,.28));">
          <path d="M17 2C9 2 2.5 8.5 2 16.6C2 27 17 42 17 42C17 42 32 27 32 16.6C31.5 8.5 25 2 17 2Z" fill="${color}" stroke="#fff" stroke-width="2.5"/>
          <text x="17" y="22" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="14" font-weight="800" fill="${textColor}">${label}</text>
        </svg>
      </div>`,
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -40],
  });
}

const DELIVERY_ICON = makeEndpointIcon("B", "#E9C46A", "#3A2E12");

function makeDriverIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:32px;height:40px;">
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 24 16 24s16-12.5 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
          <circle cx="16" cy="16" r="6" fill="#ffffff"/>
        </svg>
      </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
  });
}

function AnimatedDriverMarker({
  position,
  icon,
}: {
  position: LatLng;
  icon: L.DivIcon;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const frameRef = useRef<number | null>(null);

  const targetLat = position[0];
  const targetLng = position[1];

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    const start = marker.getLatLng();
    const startedAt = performance.now();
    const durationMs = 1_200;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      marker.setLatLng([targetLat, targetLng]);
      return;
    }

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      marker.setLatLng([
        start.lat + (targetLat - start.lat) * eased,
        start.lng + (targetLng - start.lng) * eased,
      ]);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [targetLat, targetLng]);

  return (
    <Marker ref={markerRef} position={position} icon={icon} zIndexOffset={1200}>
      <Tooltip direction="top" offset={[0, -34]} opacity={0.95}>
        Driver — live location
      </Tooltip>
    </Marker>
  );
}

export default function LiveTrackingMapInner({
  location,
  delivery,
  geometry,
  approximate,
  accent = "#0C3B67",
}: Props) {
  const driverPosition = useMemo<LatLng | null>(
    () => location ? [location.latitude, location.longitude] : null,
    [location],
  );
  const driverIcon = useMemo(() => makeDriverIcon(accent), [accent]);
  const routeOptions = useMemo(
    () => ({
      color: "#6C63FF",
      weight: 4,
      opacity: 0.85,
      dashArray: approximate ? "8 8" : undefined,
    }),
    [approximate],
  );

  return (
    <MapContainer
      center={driverPosition ?? delivery ?? NEPAL_CENTER}
      zoom={driverPosition || delivery ? 13 : NEPAL_OVERVIEW_ZOOM}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geometry.length > 0 && (
        <Polyline positions={geometry} pathOptions={routeOptions} />
      )}
      {delivery && (
        <Marker position={delivery} icon={DELIVERY_ICON} zIndexOffset={500}>
          <Tooltip direction="top" offset={[0, -38]} opacity={0.95}>
            Delivery
          </Tooltip>
        </Marker>
      )}
      {driverPosition && (
        <AnimatedDriverMarker position={driverPosition} icon={driverIcon} />
      )}
      <BoundsController
        location={location}
        delivery={delivery}
      />
    </MapContainer>
  );
}
