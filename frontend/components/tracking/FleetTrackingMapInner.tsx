"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { LatLng } from "@/lib/nepalGeo";

export type FleetMapMarker = {
  shipmentId: string;
  trackingId: string;
  latitude: number;
  longitude: number;
  driverName: string;
  statusLabel: string;
  isSelected: boolean;
  isStale: boolean;
};

export type FleetMapRoute = {
  shipmentId: string;
  pickup: LatLng | null;
  delivery: LatLng | null;
  geometry: LatLng[];
  approximate: boolean;
};

type Props = {
  markers: FleetMapMarker[];
  route: FleetMapRoute | null;
  selectedShipmentId?: string | null;
  onSelect: (shipmentId: string) => void;
};

const KATHMANDU_CENTER: LatLng = [27.7172, 85.324];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeFleetIcon(
  marker: Pick<FleetMapMarker, "trackingId" | "isSelected" | "isStale">,
): L.DivIcon {
  const color = marker.isSelected
    ? "#0C3B67"
    : marker.isStale
      ? "#C77718"
      : "#1D7A8C";
  const ring = marker.isSelected
    ? "rgba(12, 59, 103, 0.24)"
    : "rgba(29, 122, 140, 0.18)";
  const label = escapeHtml(marker.trackingId.replace(/^#/, ""));

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:42px;height:54px;">
        <span style="position:absolute;left:5px;top:5px;width:32px;height:32px;border-radius:999px;background:${ring};"></span>
        <svg width="42" height="54" viewBox="0 0 42 54" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 10px 14px rgba(12,59,103,.22));">
          <path d="M21 2C10.5 2 2 10.4 2 20.8C2 34.4 21 52 21 52C21 52 40 34.4 40 20.8C40 10.4 31.5 2 21 2Z" fill="${color}" stroke="#fff" stroke-width="3"/>
          <path d="M14 20.5H26.5L29 24.5H31V29H28.8C28.4 30.7 27 32 25.2 32C23.5 32 22 30.7 21.6 29H17.5C17.1 30.7 15.6 32 13.9 32C12.1 32 10.7 30.7 10.3 29H9V18.5C9 17.7 9.7 17 10.5 17H14V20.5ZM15.5 19H11V26.5H21V19H17V22H15.5V19ZM23 22V26.5H28.5L25.7 22H23ZM13.9 30.2C14.8 30.2 15.5 29.5 15.5 28.6C15.5 27.7 14.8 27 13.9 27C13 27 12.3 27.7 12.3 28.6C12.3 29.5 13 30.2 13.9 30.2ZM25.2 30.2C26.1 30.2 26.8 29.5 26.8 28.6C26.8 27.7 26.1 27 25.2 27C24.3 27 23.6 27.7 23.6 28.6C23.6 29.5 24.3 30.2 25.2 30.2Z" fill="#fff"/>
        </svg>
        <span style="position:absolute;left:50%;top:-2px;transform:translateX(-50%);max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid rgba(12,59,103,.12);border-radius:999px;background:#fff;padding:2px 7px;font:700 10px/1.2 Inter,system-ui,sans-serif;color:#0C3B67;">${label}</span>
      </div>`,
    iconSize: [42, 54],
    iconAnchor: [21, 52],
    popupAnchor: [0, -50],
  });
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

const PICKUP_ICON = makeEndpointIcon("A", "#6C63FF", "#ffffff");
const DELIVERY_ICON = makeEndpointIcon("B", "#E9C46A", "#3A2E12");

function AnimatedFleetMarker({
  marker,
  onSelect,
}: {
  marker: FleetMapMarker;
  onSelect: (shipmentId: string) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const frameRef = useRef<number | null>(null);
  const { isSelected, isStale, trackingId } = marker;
  const icon = useMemo(
    () => makeFleetIcon({ isSelected, isStale, trackingId }),
    [isSelected, isStale, trackingId],
  );

  useEffect(() => {
    const leafletMarker = markerRef.current;
    if (!leafletMarker) return;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    const start = leafletMarker.getLatLng();
    const target: LatLng = [marker.latitude, marker.longitude];
    const startedAt = performance.now();
    const durationMs = 1_200;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      leafletMarker.setLatLng(target);
      return;
    }

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      leafletMarker.setLatLng([
        start.lat + (target[0] - start.lat) * eased,
        start.lng + (target[1] - start.lng) * eased,
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
  }, [marker.latitude, marker.longitude]);

  return (
    <Marker
      ref={markerRef}
      position={[marker.latitude, marker.longitude]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(marker.shipmentId) }}
      zIndexOffset={marker.isSelected ? 1200 : 0}
    >
      <Tooltip direction="top" offset={[0, -44]} opacity={0.95}>
        #{marker.trackingId}
      </Tooltip>
      <Popup>
        <div className="min-w-40">
          <p className="text-sm font-bold text-[#0C3B67]">#{marker.trackingId}</p>
          <p className="mt-1 text-xs font-semibold text-[#5A6B82]">
            {marker.driverName}
          </p>
          <p className="mt-1 text-xs text-[#5A6B82]">{marker.statusLabel}</p>
        </div>
      </Popup>
    </Marker>
  );
}

function BoundsController({
  markers,
  route,
  selectedShipmentId,
}: {
  markers: FleetMapMarker[];
  route: FleetMapRoute | null;
  selectedShipmentId?: string | null;
}) {
  const map = useMap();
  const initialized = useRef(false);
  const previousSelection = useRef<string | null>(null);
  const markerKey = useMemo(
    () =>
      markers
        .map((marker) => `${marker.shipmentId}:${marker.latitude}:${marker.longitude}`)
        .join("|"),
    [markers],
  );

  useEffect(() => {
    const selectionChanged = previousSelection.current !== (selectedShipmentId ?? null);
    previousSelection.current = selectedShipmentId ?? null;
    const selected = markers.find(
      (marker) => marker.shipmentId === selectedShipmentId,
    );
    const routePoints: LatLng[] = [];
    if (route?.pickup) routePoints.push(route.pickup);
    if (route?.delivery) routePoints.push(route.delivery);
    if (selected) routePoints.push([selected.latitude, selected.longitude]);

    if (routePoints.length > 1) {
      const bounds = L.latLngBounds(routePoints);
      const allVisible = routePoints.every((point) => map.getBounds().contains(point));
      if (!initialized.current || selectionChanged || !allVisible) {
        map.fitBounds(bounds, {
          animate: initialized.current,
          maxZoom: 13,
          padding: [58, 58],
        });
      }
      initialized.current = true;
      return;
    }

    if (selected) {
      const point: LatLng = [selected.latitude, selected.longitude];
      if (!initialized.current || selectionChanged || !map.getBounds().contains(point)) {
        map.flyTo(point, Math.max(map.getZoom(), 14), {
          animate: initialized.current,
          duration: 0.8,
        });
      }
      initialized.current = true;
      return;
    }

    if (markers.length === 1) {
      map.setView([markers[0].latitude, markers[0].longitude], 14, {
        animate: initialized.current,
      });
      initialized.current = true;
      return;
    }

    if (markers.length > 1) {
      const points = markers.map<LatLng>((marker) => [marker.latitude, marker.longitude]);
      const allVisible = points.every((point) => map.getBounds().contains(point));
      if (!initialized.current || !allVisible) {
        map.fitBounds(L.latLngBounds(points), {
          animate: initialized.current,
          maxZoom: 14,
          padding: [54, 54],
        });
      }
      initialized.current = true;
    }
  }, [map, markerKey, markers, route, selectedShipmentId]);

  return null;
}

export default function FleetTrackingMapInner({
  markers,
  route,
  selectedShipmentId,
  onSelect,
}: Props) {
  const routeOptions = useMemo(
    () => ({
      color: "#6C63FF",
      weight: 4,
      opacity: 0.88,
      dashArray: route?.approximate ? "8 8" : undefined,
    }),
    [route?.approximate],
  );

  return (
    <MapContainer
      center={KATHMANDU_CENTER}
      zoom={12}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {route && route.geometry.length > 0 && (
        <Polyline positions={route.geometry} pathOptions={routeOptions} />
      )}
      {route?.pickup && (
        <Marker position={route.pickup} icon={PICKUP_ICON} zIndexOffset={500}>
          <Tooltip direction="top" offset={[0, -38]} opacity={0.95}>
            Pickup
          </Tooltip>
        </Marker>
      )}
      {route?.delivery && (
        <Marker position={route.delivery} icon={DELIVERY_ICON} zIndexOffset={500}>
          <Tooltip direction="top" offset={[0, -38]} opacity={0.95}>
            Delivery
          </Tooltip>
        </Marker>
      )}
      {markers.map((marker) => (
        <AnimatedFleetMarker
          key={marker.shipmentId}
          marker={marker}
          onSelect={onSelect}
        />
      ))}
      <BoundsController
        markers={markers}
        route={route}
        selectedShipmentId={selectedShipmentId}
      />
    </MapContainer>
  );
}
