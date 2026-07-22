import type { ComponentProps, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import DriverAssignments from "@/components/driver/DriverAssignments";
import DriverDashboard from "@/components/driver/DriverDashboard";
import DriverFleet from "@/components/driver/DriverFleet";
import DriverRoute from "@/components/driver/DriverRoute";
import { StageStepper, fmtAddress, shortLoc } from "@/components/driver/shared";

const api = vi.hoisted(() => ({
  getAssignments: vi.fn(),
  getFleet: vi.fn(),
  getMe: vi.fn(),
  getStats: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ alt }: ComponentProps<"img">) => <span role="img" aria-label={alt} />,
}));
vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="driver-map" />,
}));
vi.mock("@/lib/api/driver.api", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/lib/api/driver.api")>();
  return {
    ...original,
    driverGetAssignments: api.getAssignments,
    driverGetFleet: api.getFleet,
    driverGetMe: api.getMe,
    driverGetStats: api.getStats,
    driverUpdateStage: vi.fn(),
    driverReportFleetIncident: vi.fn(),
    driverUpdateFleetIncident: vi.fn(),
    driverDeleteFleetIncident: vi.fn(),
    driverLogFuelExpense: vi.fn(),
    driverUpdateFuelExpense: vi.fn(),
    driverDeleteFuelExpense: vi.fn(),
  };
});
vi.mock("@/lib/hooks/useAutoRefresh", () => ({ useAutoRefresh: vi.fn() }));
vi.mock("@/lib/hooks/useDriverTracking", () => ({
  isPickupConfirmed: () => false,
  useDriverTracking: () => ({
    isTracking: false,
    lastFix: null,
    error: null,
    start: vi.fn(),
    stop: vi.fn(),
  }),
}));
vi.mock("@/lib/hooks/useLiveRoute", () => ({
  useLiveRoute: () => ({
    geometry: [],
    approximate: false,
    remainingDistanceKm: null,
  }),
}));

const driverUser = {
  id: "driver-1",
  fullName: "Hari Driver",
  email: "hari@example.com",
  phoneNumber: "9800000000",
  profileImage: null,
  role: "driver" as const,
  status: "active",
};

describe("driver operational components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAssignments.mockResolvedValue([]);
    api.getStats.mockResolvedValue({
      total: 12,
      active: 0,
      deliveredToday: 2,
      completed: 10,
      codToCollect: 0,
    });
    api.getMe.mockResolvedValue({
      ...driverUser,
      licenseNumber: "LIC-100",
      branch: "Kathmandu",
      employmentStatus: "full-time",
      availabilityStatus: "available",
      vehicle: null,
    });
    api.getFleet.mockResolvedValue({
      vehicle: null,
      assignmentHistory: [],
      incidents: [],
      fuelExpenses: [],
    });
  });

  test("formats driver addresses and renders delivery progress", () => {
    expect(
      fmtAddress({ streetAddress: "Lakeside", city: "Pokhara", district: "Kaski" }),
    ).toBe("Lakeside, Pokhara, Kaski");
    expect(shortLoc({ city: "Pokhara", district: "Kaski" })).toBe("Pokhara, Kaski");
    expect(fmtAddress(undefined)).toBe("—");
    render(<StageStepper stage="in-transit" />);
    expect(screen.getByText("Picked Up")).toBeInTheDocument();
    expect(screen.getByText("In Transit")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  test("renders driver dashboard statistics and empty assignment state", async () => {
    render(<DriverDashboard user={driverUser} token="token" />);
    expect(await screen.findByText("No active delivery")).toBeInTheDocument();
    expect(screen.getByText("Delivered Today")).toBeInTheDocument();
    expect(screen.getByText("Total Completed")).toBeInTheDocument();
    expect(screen.getByText(/no vehicle assigned yet/i)).toBeInTheDocument();
  });

  test("shows a driver dashboard loading failure", async () => {
    api.getMe.mockRejectedValueOnce(new Error("Dashboard unavailable"));
    render(<DriverDashboard user={driverUser} token="token" />);
    expect(await screen.findByText("Dashboard unavailable")).toBeInTheDocument();
  });

  test("renders empty active and historical assignments", async () => {
    render(<DriverAssignments token="token" />);
    expect(await screen.findByText("No assignments today")).toBeInTheDocument();
    expect(screen.getByText("My Assignments")).toBeInTheDocument();
    expect(api.getAssignments).toHaveBeenCalledWith("token", "active");
    expect(api.getAssignments).toHaveBeenCalledWith("token", "history");
  });

  test("renders an empty route workspace", async () => {
    render(<DriverRoute token="token" />);
    expect(await screen.findByText("No route to show")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Route" })).toBeInTheDocument();
  });

  test("renders the no-vehicle fleet state", async () => {
    render(<DriverFleet token="token" />);
    expect(await screen.findByText("No vehicle assigned")).toBeInTheDocument();
    expect(screen.getByText("My Fleet")).toBeInTheDocument();
  });
});
