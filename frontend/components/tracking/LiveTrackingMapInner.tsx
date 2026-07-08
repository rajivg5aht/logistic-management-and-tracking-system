"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

type Props = {
  latitude: number;
  longitude: number;
  // Marker colour — navy in the driver/admin consoles, teal for customers.
  accent?: string;
};

// Recenters the map whenever a new fix arrives, keeping the current zoom.
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

// A themeable teardrop pin built as a divIcon. Using a divIcon avoids Leaflet's
// broken default marker-image URLs under bundlers entirely (no asset imports).
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

export default function LiveTrackingMapInner({
  latitude,
  longitude,
  accent = "#0C3B67",
}: Props) {
  const position: [number, number] = [latitude, longitude];
  const icon = useMemo(() => makeDriverIcon(accent), [accent]);

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={icon} />
      <Recenter lat={latitude} lng={longitude} />
    </MapContainer>
  );
}
