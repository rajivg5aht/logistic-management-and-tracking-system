import type { Page } from "@playwright/test";

type Role = "customer" | "driver" | "admin";

const users = {
  customer: {
    id: "customer-e2e",
    fullName: "Ram Hari",
    email: "ram@example.com",
    phoneNumber: "9812345678",
    profileImage: null,
    role: "customer",
    status: "active",
  },
  driver: {
    id: "driver-e2e",
    fullName: "Bikash Rai",
    email: "bikash@example.com",
    phoneNumber: "9823456789",
    profileImage: null,
    role: "driver",
    status: "active",
  },
  admin: {
    id: "admin-e2e",
    fullName: "Anita Shrestha",
    email: "anita@example.com",
    phoneNumber: "9834567890",
    profileImage: null,
    role: "admin",
    status: "active",
  },
} as const;

const emptyMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

function dataFor(pathname: string) {
  if (pathname.endsWith("/driver/me")) {
    return {
      ...users.driver,
      licenseNumber: "NP-E2E-001",
      branch: "Kathmandu",
      employmentStatus: "full-time",
      availabilityStatus: "available",
      vehicle: null,
    };
  }

  if (pathname.endsWith("/driver/fleet")) {
    return { vehicle: null, assignmentHistory: [], incidents: [], fuelExpenses: [] };
  }

  if (pathname.endsWith("/driver/stats")) {
    return { total: 0, active: 0, deliveredToday: 0, completed: 0, codToCollect: 0 };
  }

  if (pathname.endsWith("/admin/users/stats")) {
    return { total: 0, newSignups24h: 0, signupsThisMonth: 0, growthPct: 0, registrationTrend: [] };
  }

  if (pathname.endsWith("/admin/drivers/stats")) {
    return { total: 0, onDelivery: 0, offDuty: 0, available: 0, inactive: 0 };
  }

  if (pathname.endsWith("/admin/vehicles/stats")) {
    return { total: 0, available: 0, active: 0, maintenanceRequired: 0, inactive: 0 };
  }

  if (pathname.endsWith("/admin/shipments/stats")) {
    return {
      total: 0,
      pending: 0,
      inTransit: 0,
      delivered: 0,
      cancelled: 0,
      deliveredToday: 0,
      pendingCodAmount: 0,
      dailyVolume: [],
    };
  }

  if (pathname.endsWith("/admin/shipments/analytics")) {
    return {
      totalRevenue: 0,
      revenueDelta: 0,
      deliveries: 0,
      deliveriesDelta: 0,
      avgDeliveryMs: null,
      avgTimeDelta: 0,
      successRate: 0,
      successDelta: 0,
      monthlyRevenue: [],
      regionVolume: [],
      totalShipments: 0,
    };
  }

  if (pathname.endsWith("/admin/payments/stats")) {
    return { revenue: 0, outstandingCod: 0, codHeldByDrivers: 0, refunds: 0 };
  }

  if (pathname.endsWith("/admin/inquiries/stats")) {
    return { total: 0, pending: 0, resolved: 0, newToday: 0, resolvedRate: 0 };
  }

  if (pathname.endsWith("/admin/fleet-reports/stats")) {
    return { pendingIncidents: 0, pendingFuelExpenses: 0, approvedFuelExpenses: 0 };
  }

  return [];
}

export async function useRole(page: Page, role: Role) {
  await page.context().addCookies([
    {
      name: `token_${role}`,
      value: `e2e-${role}-token`,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: `user_${role}`,
      value: JSON.stringify(users[role]),
      domain: "127.0.0.1",
      path: "/",
      sameSite: "Lax",
    },
  ]);
}

export async function mockApi(page: Page) {
  await page.route("**/api/v1/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: 200,
        success: true,
        message: "E2E fixture",
        data: dataFor(pathname),
        meta: emptyMeta,
      }),
    });
  });
}
