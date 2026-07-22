import type { ComponentProps, ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { CustomerHeader } from "@/components/dashboard/CustomerHeader";
import CustomerLayoutClient from "@/components/dashboard/CustomerLayoutClient";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { Sidebar } from "@/components/dashboard/Sidebar";
import AccountSettings from "@/components/profile/AccountSettings";

const navigation = vi.hoisted(() => ({ pathname: "/dashboard", push: vi.fn() }));
const api = vi.hoisted(() => ({
  getAnnouncements: vi.fn(),
  getShipments: vi.fn(),
}));
const currentUser = vi.hoisted(() => ({
  id: "customer-1",
  fullName: "Ram Laxmi",
  email: "ram@example.com",
  phoneNumber: "9800000000",
  profileImage: null,
  role: "customer" as const,
  status: "active",
  createdAt: "2025-01-01T00:00:00.000Z",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
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
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: currentUser, isLoading: false, setUser: vi.fn() }),
}));
vi.mock("@/components/assistant/AiAssistant", () => ({
  AiAssistant: () => <button type="button">AI Assistant</button>,
}));
vi.mock("@/lib/api/announcement.api", () => ({
  getMyAnnouncements: api.getAnnouncements,
}));
vi.mock("@/lib/api/shipment.api", () => ({
  getMyShipments: api.getShipments,
  getShipmentDisplayStatus: (shipment: { status: string }) => shipment.status,
}));
vi.mock("@/lib/hooks/useAutoRefresh", () => ({ useAutoRefresh: vi.fn() }));
vi.mock("@/actions/auth.actions", () => ({
  updateProfileAction: vi.fn(),
  updatePasswordAction: vi.fn(),
}));

const shipment = {
  id: "shipment-1",
  trackingId: "LN-1001",
  status: "pending",
  createdAt: "2026-07-20T00:00:00.000Z",
  assignedDriver: null,
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
    streetAddress: "Jawalakhel",
    city: "Lalitpur",
    district: "Lalitpur",
  },
  package: { parcelType: "standard", weight: "2", quantity: 1 },
};

describe("customer dashboard navigation and profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigation.pathname = "/dashboard";
    api.getAnnouncements.mockResolvedValue([]);
    api.getShipments.mockResolvedValue([]);
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  });

  test("renders customer navigation and logs out", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "Payments" })).toHaveAttribute(
      "href",
      "/payments",
    );
    await user.click(screen.getByRole("button", { name: "Logout" }));
    expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(navigation.push).toHaveBeenCalledWith("/login");
  });

  test("persists sidebar collapse and restores it", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(localStorage.getItem("sidebar-collapsed")).toBe("true");
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
  });

  test("tracks from the customer header and opens announcements", async () => {
    api.getAnnouncements.mockResolvedValueOnce([
      {
        id: "notice-1",
        title: "Delivery update",
        message: "Kathmandu routes are operating normally.",
        audience: "customer",
        createdBy: "admin-1",
        createdAt: "2026-07-22T00:00:00.000Z",
        updatedAt: "2026-07-22T00:00:00.000Z",
      },
    ]);
    const user = userEvent.setup();
    render(<CustomerHeader token="token" />);
    await user.type(screen.getByLabelText("Tracking ID"), " ln-2002 ");
    await user.click(screen.getByRole("button", { name: "Track shipment" }));
    expect(navigation.push).toHaveBeenCalledWith("/tracking?trackingId=LN-2002");
    const notifications = await screen.findByRole("button", {
      name: "1 announcement notifications",
    });
    await user.click(notifications);
    expect(screen.getByRole("dialog", { name: "Announcement notifications" })).toHaveTextContent(
      "Delivery update",
    );
  });

  test("restores the customer layout collapsed state from storage", async () => {
    localStorage.setItem("sidebar-collapsed", "true");
    const { container } = render(
      <CustomerLayoutClient token="token">
        <p>Customer page</p>
      </CustomerLayoutClient>,
    );
    expect(screen.getByText("Customer page")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll("div")).some((element) =>
          element.className.includes("lg:ml-[76px]"),
        ),
      ).toBe(true),
    );
  });

  test("shows empty dashboard state and validates tracking input", async () => {
    const user = userEvent.setup();
    render(<DashboardOverview user={currentUser} token="token" />);
    expect(await screen.findByText("No active shipments")).toBeInTheDocument();
    expect(screen.queryByText("Live Fleet Tracking")).not.toBeInTheDocument();
    expect(screen.getByText("Insured Transit")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Track Now" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a tracking ID to continue.",
    );
  });

  test("renders active shipments and routes a tracking search", async () => {
    api.getShipments.mockResolvedValueOnce([shipment]);
    const user = userEvent.setup();
    render(<DashboardOverview user={currentUser} token="token" />);
    expect(await screen.findAllByText("LN-1001")).not.toHaveLength(0);
    expect(screen.getByRole("columnheader", { name: "Tracking ID" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View shipment LN-1001" })).toHaveAttribute(
      "href",
      "/tracking?trackingId=LN-1001",
    );
    await user.type(screen.getByLabelText("Tracking ID"), "LN-3003");
    await user.click(screen.getByRole("button", { name: "Track Now" }));
    expect(navigation.push).toHaveBeenCalledWith("/tracking?trackingId=LN-3003");
  });

  test("switches account settings between profile and security", async () => {
    const user = userEvent.setup();
    render(<AccountSettings user={currentUser} />);
    expect(screen.getByText("Personal Profile")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Security" }));
    expect(screen.getByText("New Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm New Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Password" })).toBeInTheDocument();
  });
});
