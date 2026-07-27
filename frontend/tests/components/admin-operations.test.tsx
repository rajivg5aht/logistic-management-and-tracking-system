import type { ComponentProps, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import AdminDriverManagement from "@/components/admin/AdminDriverManagement";
import AdminFleetManagement from "@/components/admin/AdminFleetManagement";
import AdminFleetReports from "@/components/admin/AdminFleetReports";
import AdminInquiries from "@/components/admin/AdminInquiries";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminShipments from "@/components/admin/AdminShipments";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import OverviewDashboard from "@/components/admin/OverviewDashboard";

const api = vi.hoisted(() => ({
  getAnalytics: vi.fn(),
  getAnnouncements: vi.fn(),
  getDrivers: vi.fn(),
  getDriverStats: vi.fn(),
  getFleetStats: vi.fn(),
  getFuelExpenses: vi.fn(),
  getIncidents: vi.fn(),
  getInquiries: vi.fn(),
  getInquiryStats: vi.fn(),
  getPayments: vi.fn(),
  getPaymentStats: vi.fn(),
  getShipments: vi.fn(),
  getShipmentStats: vi.fn(),
  getUsers: vi.fn(),
  getUserStats: vi.fn(),
  getVehicles: vi.fn(),
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
  default: () => () => <div data-testid="admin-map" />,
}));
vi.mock("@/lib/hooks/useAutoRefresh", () => ({ useAutoRefresh: vi.fn() }));
vi.mock("@/lib/hooks/useShipmentLiveLocation", () => ({
  useShipmentLiveLocation: () => ({ location: null, connected: false }),
}));

vi.mock("@/lib/api/admin.api", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/lib/api/admin.api")>();
  return {
    ...original,
    adminGetUsers: api.getUsers,
    adminGetUserStats: api.getUserStats,
    adminCreateUser: vi.fn(),
    adminUpdateUser: vi.fn(),
    adminDeleteUser: vi.fn(),
  };
});
vi.mock("@/lib/api/announcement.api", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/lib/api/announcement.api")>();
  return {
    ...original,
    adminGetAnnouncements: api.getAnnouncements,
    adminCreateAnnouncement: vi.fn(),
    adminDeleteAnnouncement: vi.fn(),
  };
});
vi.mock("@/lib/api/driver.api", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/lib/api/driver.api")>();
  return {
    ...original,
    adminGetDrivers: api.getDrivers,
    adminGetDriverStats: api.getDriverStats,
    adminCreateDriver: vi.fn(),
    adminUpdateDriver: vi.fn(),
    adminDeleteDriver: vi.fn(),
  };
});
vi.mock("@/lib/api/fleet.api", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/lib/api/fleet.api")>();
  return {
    ...original,
    adminGetFleetStats: api.getFleetStats,
    adminGetVehicles: api.getVehicles,
    adminAssignVehicle: vi.fn(),
    adminCreateVehicle: vi.fn(),
    adminDeactivateVehicle: vi.fn(),
    adminRemoveVehicle: vi.fn(),
    adminUpdateVehicle: vi.fn(),
    adminUploadVehicleImage: vi.fn(),
  };
});
vi.mock("@/lib/api/fleetReports.api", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/lib/api/fleetReports.api")>();
  return {
    ...original,
    adminGetIncidents: api.getIncidents,
    adminGetFuelExpenses: api.getFuelExpenses,
    adminUpdateIncident: vi.fn(),
    adminUpdateFuelExpense: vi.fn(),
  };
});
vi.mock("@/lib/api/inquiry.api", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/lib/api/inquiry.api")>();
  return {
    ...original,
    adminGetInquiries: api.getInquiries,
    adminGetInquiryStats: api.getInquiryStats,
    adminUpdateInquiry: vi.fn(),
    adminDeleteInquiry: vi.fn(),
  };
});
vi.mock("@/lib/api/payment.api", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/lib/api/payment.api")>();
  return {
    ...original,
    adminGetPayments: api.getPayments,
    adminGetPaymentStats: api.getPaymentStats,
    adminSettleCod: vi.fn(),
    adminRefundPayment: vi.fn(),
  };
});
vi.mock("@/lib/api/shipment.api", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/lib/api/shipment.api")>();
  return {
    ...original,
    adminGetShipments: api.getShipments,
    adminGetShipmentStats: api.getShipmentStats,
    adminGetAnalytics: api.getAnalytics,
    adminUpdateShipment: vi.fn(),
    adminDeleteShipment: vi.fn(),
  };
});

const emptyMeta = { page: 1, limit: 10, total: 0, totalPages: 0 };
const emptyShipmentStats = {
  total: 0,
  pending: 0,
  inTransit: 0,
  delivered: 0,
  cancelled: 0,
  deliveredToday: 0,
  pendingCodAmount: 0,
  dailyVolume: [],
};
const emptyFleetStats = {
  total: 0,
  available: 0,
  active: 0,
  maintenanceRequired: 0,
  inactive: 0,
};
const adminUser = {
  id: "admin-1",
  fullName: "Laxmi Admin",
  email: "laxmi@example.com",
  phoneNumber: "9800000000",
  profileImage: null,
  role: "admin" as const,
  status: "active",
};

describe("admin operational components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getShipments.mockResolvedValue({ data: [], meta: emptyMeta });
    api.getShipmentStats.mockResolvedValue(emptyShipmentStats);
    api.getAnalytics.mockResolvedValue({
      totalRevenue: 125000,
      revenueDelta: 12,
      deliveries: 42,
      deliveriesDelta: 5,
      avgDeliveryMs: 7_200_000,
      avgTimeDelta: -10,
      successRate: 96,
      successDelta: 2,
      monthlyRevenue: [{ label: "Jul", revenue: 125000 }],
      regionVolume: [{ region: "Kathmandu", count: 42 }],
      totalShipments: 42,
    });
    api.getFleetStats.mockResolvedValue(emptyFleetStats);
    api.getVehicles.mockResolvedValue({ data: [], meta: emptyMeta });
    api.getDrivers.mockResolvedValue({ data: [], meta: emptyMeta });
    api.getDriverStats.mockResolvedValue({
      total: 0,
      onDelivery: 0,
      offDuty: 0,
      available: 0,
      inactive: 0,
    });
    api.getUsers.mockResolvedValue({ data: [], meta: emptyMeta });
    api.getUserStats.mockResolvedValue({
      total: 0,
      newSignups24h: 0,
      signupsThisMonth: 0,
      growthPct: 0,
      registrationTrend: [],
    });
    api.getPayments.mockResolvedValue({ data: [], meta: emptyMeta });
    api.getPaymentStats.mockResolvedValue({
      revenue: 0,
      outstandingCod: 0,
      codHeldByDrivers: 0,
      refunds: 0,
    });
    api.getInquiries.mockResolvedValue({ data: [], meta: emptyMeta });
    api.getInquiryStats.mockResolvedValue({
      total: 0,
      pending: 0,
      resolved: 0,
      newToday: 0,
      resolvedRate: 0,
    });
    api.getAnnouncements.mockResolvedValue([]);
    api.getIncidents.mockResolvedValue({ data: [], meta: emptyMeta });
    api.getFuelExpenses.mockResolvedValue({ data: [], meta: emptyMeta });
  });

  test("loads the logistics overview with live operational totals", async () => {
    render(<OverviewDashboard token="token" />);
    expect(await screen.findByText("Logistics Overview")).toBeInTheDocument();
    expect(screen.getByText("Total Shipments")).toBeInTheDocument();
    expect(api.getShipments).toHaveBeenCalledWith("token", 1, 4);
    expect(api.getFleetStats).toHaveBeenCalledWith("token");
  });

  test("uses an initial header search to filter shipments", async () => {
    render(<AdminShipments token="token" initialSearch="CN-123" />);
    expect(await screen.findByText(/No shipments found/)).toBeInTheDocument();
    expect(api.getShipments).toHaveBeenCalledWith("token", 1, 10, "CN-123", undefined);
  });

  test("renders analytics returned by shipment and fleet services", async () => {
    api.getFleetStats.mockResolvedValueOnce({
      total: 10,
      available: 4,
      active: 5,
      maintenanceRequired: 1,
      inactive: 0,
    });
    render(<AdminAnalytics token="token" />);
    expect(await screen.findByText("96%")).toBeInTheDocument();
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Kathmandu")).toBeInTheDocument();
  });

  test("shows the empty user directory and account action", async () => {
    render(<AdminUserManagement token="token" currentUser={adminUser} />);
    expect(await screen.findByText("No users found.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add account/i })).toBeInTheDocument();
    expect(api.getUserStats).toHaveBeenCalledWith("token");
  });

  test("shows the empty driver directory and driver action", async () => {
    render(<AdminDriverManagement token="token" />);
    expect(await screen.findByText(/No drivers found/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add driver/i })).toBeInTheDocument();
    expect(api.getDriverStats).toHaveBeenCalledWith("token");
  });

  test("shows the empty fleet catalogue and vehicle action", async () => {
    render(<AdminFleetManagement token="token" />);
    expect(await screen.findByText("No vehicles found.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add vehicle/i })).toBeInTheDocument();
    expect(api.getFleetStats).toHaveBeenCalledWith("token");
  });

  test("renders empty shipment, payment, inquiry, announcement, and report queues", async () => {
    const shipmentView = render(<AdminShipments token="token" />);
    expect(await screen.findByText(/No shipments found/)).toBeInTheDocument();
    shipmentView.unmount();

    const paymentView = render(<AdminPayments token="token" />);
    expect(await screen.findByText("No payments match these filters.")).toBeInTheDocument();
    paymentView.unmount();

    const inquiryView = render(<AdminInquiries token="token" />);
    expect(await screen.findByText("No inquiries found.")).toBeInTheDocument();
    expect(screen.queryByText("Need to scale?")).not.toBeInTheDocument();
    inquiryView.unmount();

    const announcementView = render(<AdminAnnouncements token="token" />);
    expect(await screen.findByText("No announcements published")).toBeInTheDocument();
    announcementView.unmount();

    render(<AdminFleetReports token="token" />);
    expect(await screen.findByText("No issue reports.")).toBeInTheDocument();
  });
});
