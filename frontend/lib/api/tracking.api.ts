import { authenticatedRequest } from "@/lib/api/api-client";

export type LiveLocation = {
  shipmentId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  isLive: boolean;
  startedAt: string | null;
  stoppedAt: string | null;
  updatedAt: string;
};

export type DriverLocationUpdate = {
  shipmentId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
};

export type TrackingStatusUpdate = {
  shipmentId: string;
  driverId: string;
  isLive: boolean;
  updatedAt: string;
};

export type TrackingError = {
  status: number;
  message: string;
};

export async function getShipmentLocation(
  token: string,
  id: string,
): Promise<LiveLocation | null> {
  return authenticatedRequest<LiveLocation | null>(
    `/api/v1/shipments/${id}/location`,
    token,
    { method: "GET" },
  );
}
