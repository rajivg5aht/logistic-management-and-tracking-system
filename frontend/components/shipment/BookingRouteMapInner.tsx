"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
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
  pickup: LatLng | null;
  delivery: LatLng | null;
  geometry: LatLng[];
  approximate: boolean;
};

function makePinIcon(label: string, color: string, textColor: string): L.DivIcon {
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

const PICKUP_ICON = makePinIcon("A", "#E9C46A", "#ffffff");
const DELIVERY_ICON = makePinIcon("B", "#E9C46A", "#3A2E12");

function FitBounds({
  pickup,
  delivery,
}: {
  pickup: LatLng | null;
  delivery: LatLng | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (pickup && delivery) {
      map.fitBounds(L.latLngBounds([pickup, delivery]), {
        animate: true,
        maxZoom: 12,
        padding: [48, 48],
      });
    } else if (pickup) {
      map.setView(pickup, 11, { animate: true });
    } else if (delivery) {
      map.setView(delivery, 11, { animate: true });
    } else {
      map.setView(NEPAL_CENTER, NEPAL_OVERVIEW_ZOOM, { animate: true });
    }
  }, [map, pickup, delivery]);

  return null;
}

export default function BookingRouteMapInner({
  pickup,
  delivery,
  geometry,
  approximate,
}: Props) {
  const routeOptions = useMemo(
    () => ({
      color: "#E9C46A",
      weight: 4,
      opacity: 0.85,
      dashArray: approximate ? "8 8" : undefined,
    }),
    [approximate],
  );

  return (
    <MapContainer
      center={NEPAL_CENTER}
      zoom={NEPAL_OVERVIEW_ZOOM}
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

      {pickup && (
        <Marker position={pickup} icon={PICKUP_ICON}>
          <Tooltip direction="top" offset={[0, -38]} opacity={0.95}>
            Pickup
          </Tooltip>
        </Marker>
      )}

      {delivery && (
        <Marker position={delivery} icon={DELIVERY_ICON}>
          <Tooltip direction="top" offset={[0, -38]} opacity={0.95}>
            Delivery
          </Tooltip>
        </Marker>
      )}

      <FitBounds pickup={pickup} delivery={delivery} />
    </MapContainer>
  );
}
