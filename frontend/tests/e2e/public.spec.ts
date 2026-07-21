import { expect, test } from "@playwright/test";

test("visitor can open the public site and registration", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Logistics Reimagined/i })).toBeVisible();
  await page.getByRole("link", { name: "Register" }).first().click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
});

test("visitor can start public parcel tracking", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("textbox", { name: "Tracking ID" }).fill("ln-98742");
  await page.getByRole("button", { name: /Track Now/i }).click();
  await expect(page).toHaveURL(/\/track\?trackingId=LN-98742$/);
  await expect(page.getByRole("heading", { name: /Track Your Shipment/i })).toBeVisible();
});
test("visitor can navigate the password recovery flow", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot Password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByText("Reset your password", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Email Address")).toBeVisible();
  await page.getByRole("link", { name: "Back to Sign In" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
