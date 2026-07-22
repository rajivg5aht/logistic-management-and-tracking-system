import { expect, test } from "@playwright/test";
import { mockApi, useRole } from "./helpers";

test.beforeEach(async ({ page }) => {
  await useRole(page, "admin");
  await mockApi(page);
});

test("admin can open the logistics overview", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Logistics Overview" })).toBeVisible();
  await expect(page.getByText("Total Shipments")).toBeVisible();
});

test("admin can open user management", async ({ page }) => {
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Account" })).toBeVisible();
});

test("admin can open shipment management", async ({ page }) => {
  await page.goto("/admin/shipments");
  await expect(page.getByRole("heading", { name: "Shipment Management" })).toBeVisible();
  await expect(page.getByPlaceholder(/Search tracking/i)).toBeVisible();
});

test("admin can open driver management", async ({ page }) => {
  await page.goto("/admin/drivers");
  await expect(page.getByRole("heading", { name: "Driver Management" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Add Driver/i })).toBeVisible();
});

test("admin can open fleet management", async ({ page }) => {
  await page.goto("/admin/fleet");
  await expect(page.getByRole("heading", { name: "Fleet Management" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Add Vehicle/i })).toBeVisible();
});

test("admin can open payment management", async ({ page }) => {
  await page.goto("/admin/payments");
  await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
  await expect(page.getByText("Outstanding COD")).toBeVisible();
});
test("admin can publish an announcement and review fleet reports", async ({ page }) => {
  await page.goto("/admin/inquiries");
  await page.getByRole("tab", { name: "Announcements" }).click();
  await page.getByPlaceholder("Important service update").fill("Monsoon service update");
  await page.getByPlaceholder("Write the announcement recipients will see...").fill(
    "Delivery times may be longer in areas affected by heavy rain.",
  );
  await page.getByRole("button", { name: "Publish announcement" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Announcement published to Customers & Drivers.",
  );

  await page.goto("/admin/fleet/reports");
  await expect(page.getByRole("heading", { name: "Fleet Reports" })).toBeVisible();
  await page.getByRole("button", { name: "Fuel Expenses" }).click();
  await expect(page.getByText("No fuel expenses.")).toBeVisible();
});
