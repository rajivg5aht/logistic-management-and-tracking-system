"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { FleetMapMarker } from "./FleetTrackingMap";

type Props = {
  markers: FleetMapMarker[];
  selectedShipmentId?: string | null;
  onSelect: (shipmentId: string) => void;
};

const KATHMANDU_CENTER: [number, number] = [27.7172, 85.324];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeFleetIcon(marker: FleetMapMarker): L.DivIcon {
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

function BoundsController({
  markers,
  selectedShipmentId,
}: {
  markers: FleetMapMarker[];
  selectedShipmentId?: string | null;
}) {
  const map = useMap();
  const markerKey = useMemo(
    () =>
      markers
        .map((marker) => `${marker.shipmentId}:${marker.latitude}:${marker.longitude}`)
        .join("|"),
    [markers],
  );

  useEffect(() => {
    const selected = markers.find(
      (marker) => marker.shipmentId === selectedShipmentId,
    );

    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 14), {
        animate: true,
        duration: 0.8,
      });
      return;
    }

    if (markers.length === 1) {
      map.setView([markers[0].latitude, markers[0].longitude], 14, {
        animate: true,
      });
      return;
    }

    if (markers.length > 1) {
      const bounds = L.latLngBounds(
        markers.map((marker) => [marker.latitude, marker.longitude]),
      );
      map.fitBounds(bounds, {
        animate: true,
        maxZoom: 14,
        padding: [54, 54],
      });
    }
  }, [map, markerKey, markers, selectedShipmentId]);

  return null;
}

export default function FleetTrackingMapInner({
  markers,
  selectedShipmentId,
  onSelect,
}: Props) {
  const icons = useMemo(() => {
    const result = new Map<string, L.DivIcon>();
    for (const marker of markers) {
      result.set(marker.shipmentId, makeFleetIcon(marker));
    }
    return result;
  }, [markers]);

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
      {markers.map((marker) => (
        <Marker
          key={marker.shipmentId}
          position={[marker.latitude, marker.longitude]}
          icon={icons.get(marker.shipmentId)}
          eventHandlers={{ click: () => onSelect(marker.shipmentId) }}
          zIndexOffset={marker.shipmentId === selectedShipmentId ? 1000 : 0}
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
      ))}
      <BoundsController
        markers={markers}
        selectedShipmentId={selectedShipmentId}
      />
    </MapContainer>
  );
}