import { useEffect, type ReactNode } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { BookingRouteMap } from "@/components/shipment/BookingRouteMap";
import { DetailedSummaryCard } from "@/components/shipment/DetailedSummaryCard";
import FleetTrackingMap from "@/components/tracking/FleetTrackingMap";
import LiveMap from "@/components/tracking/LiveMap";
import PublicTrackingPanel from "@/components/tracking/PublicTrackingPanel";
import TrackingPanel from "@/components/tracking/TrackingPanel";
import { ShipmentProvider, useShipment } from "@/context/ShipmentContext";

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));
const api = vi.hoisted(() => ({
  fetchRoute: vi.fn(),
  getMyShipments: vi.fn(),
  trackByCode: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
}));
vi.mock("next/dynamic", () => ({
  default: () =>
    function DynamicMap(props: Record<string, unknown>) {
      return <div data-testid="dynamic-map" data-props={JSON.stringify(props)} />;
    },
}));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
vi.mock("@/lib/api/shipment.api", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/lib/api/shipment.api")>();
  return {
    ...original,
    getMyShipments: api.getMyShipments,
    trackByCode: api.trackByCode,
  };
});
vi.mock("@/lib/routing", () => ({ fetchRoute: api.fetchRoute }));
vi.mock("@/lib/hooks/useAutoRefresh", () => ({ useAutoRefresh: vi.fn() }));
vi.mock("@/lib/hooks/useShipmentLiveLocation", () => ({
  useShipmentLiveLocation: () => ({ location: null }),
}));
vi.mock("@/lib/hooks/useLiveRoute", () => ({
  useLiveRoute: () => ({
    geometry: [],
    approximate: false,
    remainingDistanceKm: 12,
    remainingDistanceLabel: "12 km",
    etaMinutes: 35,
    etaLabel: "35 min",
    arrivalLabel: "10:30 AM",
  }),
}));

const shipment = {
  id: "shipment-1",
  trackingId: "LN-5001",
  customer: "customer-1",
  pickup: {
    fullName: "Ram",
    phoneNumber: "9800000000",
    streetAddress: "Koteshwor",
    city: "Kathmandu",
    district: "Kathmandu",
  },
  delivery: {
    recipientName: "Laxmi",
    phoneNumber: "9811111111",
    streetAddress: "Lakeside",
    city: "Pokhara",
    district: "Kaski",
  },
  package: {
    parcelType: "fragile" as const,
    weight: "3",
    quantity: 2,
    dimensions: { length: "20", width: "15", height: "10" },
  },
  service: "express" as const,
  insurance: true,
  specialHandling: true,
  paymentMethod: "cod" as const,
  paymentStatus: "pending" as const,
  deliveredAt: null,
  proofOfDelivery: null,
  amount: 950,
  status: "in-transit" as const,
  assignedDriver: "Hari Driver",
  assignedDriverId: "driver-1",
  assignedVehicle: "BA 1 PA 1000",
  assignedVehicleId: "vehicle-1",
  driverStage: "in-transit" as const,
  currentLocation: null,
  timeline: [
    {
      stage: "picked-up" as const,
      at: "2026-07-21T09:00:00.000Z",
      note: "Collected from sender",
    },
  ],
  createdAt: "2026-07-20T08:00:00.000Z",
  updatedAt: "2026-07-21T09:00:00.000Z",
};

function FilledShipment({ children }: { children: ReactNode }) {
  const {
    setDeliveryAddress,
    setInsurance,
    setPackageDetails,
    setPickupAddress,
    setSelectedService,
    setSpecialHandling,
  } = useShipment();
  useEffect(() => {
    setPickupAddress({
      fullName: "Ram",
      phoneNumber: "9800000000",
      streetAddress: "Koteshwor",
      city: "Kathmandu",
      district: "Kathmandu",
      saveToAddressBook: false,
    });
    setDeliveryAddress({
      recipientName: "Laxmi",
      phoneNumber: "9811111111",
      streetAddress: "Lakeside",
      city: "Pokhara",
      district: "Kaski",
      residentialAddress: true,
    });
    setPackageDetails(shipment.package);
    setSelectedService("express");
    setInsurance(true);
    setSpecialHandling(true);
  }, [
    setDeliveryAddress,
    setInsurance,
    setPackageDetails,
    setPickupAddress,
    setSelectedService,
    setSpecialHandling,
  ]);
  return children;
}

describe("shipment summaries, route maps, and tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getMyShipments.mockResolvedValue([]);
    api.trackByCode.mockResolvedValue(shipment);
    api.fetchRoute.mockResolvedValue({
      distanceKm: 42,
      geometry: [],
      approximate: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders a complete shipment and pricing summary", async () => {
    render(
      <ShipmentProvider>
        <FilledShipment>
          <DetailedSummaryCard />
        </FilledShipment>
      </ShipmentProvider>,
    );
    expect(await screen.findByText("Koteshwor")).toBeInTheDocument();
    expect(screen.getByText("Lakeside")).toBeInTheDocument();
    expect(screen.getByText("Fragile / High Value")).toBeInTheDocument();
    expect(screen.getByText("Express Courier")).toBeInTheDocument();
    expect(screen.getByText("Insurance")).toBeInTheDocument();
    expect(screen.getByText("Special Handling")).toBeInTheDocument();
  });

  test("calculates the selected booking route", async () => {
    vi.useFakeTimers();
    render(
      <ShipmentProvider>
        <FilledShipment>
          <BookingRouteMap />
        </FilledShipment>
      </ShipmentProvider>,
    );
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(api.fetchRoute).toHaveBeenCalledTimes(1);
    expect(screen.getByText("42 km")).toBeInTheDocument();
  });

  test("validates an empty public tracking search", async () => {
    const user = userEvent.setup();
    render(<PublicTrackingPanel />);
    await user.click(screen.getByRole("button", { name: "Track Now" }));
    expect(screen.getByText("Enter a tracking ID to continue.")).toBeInTheDocument();
  });

  test("loads a public shipment and updates the tracking URL", async () => {
    render(<PublicTrackingPanel initialTrackingId="ln-5001" />);
    expect(await screen.findByText("LN-5001")).toBeInTheDocument();
    expect(api.trackByCode).toHaveBeenCalledWith("LN-5001");
  });

  test("shows when a tracking ID is absent from the customer account", async () => {
    render(<TrackingPanel token="token" initialTrackingId="LN-404" />);
    expect(
      await screen.findByText(
        "No shipment with this tracking ID was found in your account.",
      ),
    ).toBeInTheDocument();
  });

  test("loads the matching customer shipment", async () => {
    api.getMyShipments.mockResolvedValue([shipment]);
    render(<TrackingPanel token="token" initialTrackingId="ln-5001" />);
    expect(await screen.findByText("LN-5001")).toBeInTheDocument();
    expect(screen.getByText("Collected from sender")).toBeInTheDocument();
  });

  test("renders live map waiting and route information", () => {
    const { rerender } = render(
      <LiveMap location={null} waitingLabel="Waiting for GPS" />,
    );
    expect(screen.getByText("Waiting for GPS")).toBeInTheDocument();
    rerender(
      <LiveMap
        location={{ latitude: 27.7, longitude: 85.3 }}
        delivery={{ lat: 27.6, lng: 85.4 }}
      />,
    );
    expect(screen.getByText("12 km")).toBeInTheDocument();
    expect(screen.getByText("35 min")).toBeInTheDocument();
  });

  test("renders empty and populated fleet map states", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <FleetTrackingMap markers={[]} onSelect={onSelect} height={300} />,
    );
    expect(screen.getByText("No live GPS pins yet")).toBeInTheDocument();
    rerender(
      <FleetTrackingMap
        markers={[
          {
            shipmentId: "shipment-1",
            trackingId: "LN-5001",
            latitude: 27.7,
            longitude: 85.3,
            status: "in-transit",
          },
        ]}
        onSelect={onSelect}
      />,
    );
    expect(screen.queryByText("No live GPS pins yet")).not.toBeInTheDocument();
  });
});
