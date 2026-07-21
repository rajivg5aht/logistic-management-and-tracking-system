import { expect, test } from "@playwright/test";
import { mockApi, useRole } from "./helpers";

test.beforeEach(async ({ page }) => {
  await useRole(page, "driver");
  await mockApi(page);
});

test("driver can open the operational dashboard", async ({ page }) => {
  await page.goto("/driver");
  await expect(page.getByRole("heading", { name: "Welcome back, Bikash" })).toBeVisible();
  await expect(page.getByText("Active Delivery", { exact: true })).toBeVisible();
});

test("driver can review delivery assignments", async ({ page }) => {
  await page.goto("/driver/assignments");
  await expect(page.getByRole("heading", { name: "Your delivery trips" })).toBeVisible();
  await expect(page.getByText("Completed Trips", { exact: true })).toBeVisible();
});

test("driver can open the route workspace", async ({ page }) => {
  await page.goto("/driver/route");
  await expect(page.getByRole("heading", { name: "Route", exact: true })).toBeVisible();
  await expect(page.getByText(/active delivery route/i)).toBeVisible();
});

test("driver can open assigned vehicle records", async ({ page }) => {
  await page.goto("/driver/fleet");
  await expect(page.getByRole("heading", { name: "Assigned Vehicle" })).toBeVisible();
  await expect(page.getByText(/vehicle details, assignment history/i)).toBeVisible();
});
