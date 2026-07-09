const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// A live driver GPS position for a shipment, shared by the socket broadcast
// (`shipment-location-updated`) and the REST seed endpoint below.
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

// Payload a driver emits per GPS fix via `driver-location-update`.
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

// Error shape the server sends on the `tracking-error` event.
export type TrackingError = {
  status: number;
  message: string;
};

// Returns the last saved location for a shipment, or null if none yet. Used to
// seed the map before live socket updates arrive.
export async function getShipmentLocation(
  token: string,
  id: string,
): Promise<LiveLocation | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/shipments/${id}/location`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to load shipment location");
  }

  return data.data;
}
