import { expect, test } from "@playwright/test";
import { mockApi, useRole } from "./helpers";

test("customer pages redirect visitors to sign in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});

test("customer can open the dashboard", async ({ page }) => {
  await useRole(page, "customer");
  await mockApi(page);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Your Logistics Overview" })).toBeVisible();
  await expect(page.getByText("Ram Hari").first()).toBeVisible();
});

test("customer validates and completes the booking address step", async ({ page }) => {
  await useRole(page, "customer");
  await mockApi(page);
  await page.goto("/shipments" );
  await page.waitForLoadState("networkidle" );
  await page.getByRole("button", { name: "Next Step" }).click();
  await expect(page.getByText("Please fix the following errors:")).toBeVisible();

  await page.getByPlaceholder("e.g. Ram Hari").fill("Ram Hari");
  await page.getByPlaceholder("98XXXXXXXX").nth(0).fill("9812345678");
  await page.getByPlaceholder("Street name, Building No, Tole").nth(0).fill("Lazimpat 2");
  await page.getByRole("combobox").nth(0).selectOption("Kathmandu");
  await page.getByPlaceholder("e.g. Kathmandu").fill("Kathmandu");

  await page.getByPlaceholder("e.g. Ram Laxmi").fill("Ram Laxmi");
  await page.getByPlaceholder("98XXXXXXXX").nth(1).fill("9823456789");
  await page.getByPlaceholder("Street name, Building No, Tole").nth(1).fill("Patan 5");
  await page.getByRole("combobox").nth(1).selectOption("Lalitpur");
  await page.getByPlaceholder("e.g. Lalitpur").fill("Lalitpur");

  await page.getByRole("button", { name: "Next Step" }).click();
  await expect(page.getByText("Select Parcel Type")).toBeVisible();
});

test("customer can open shipment history", async ({ page }) => {
  await useRole(page, "customer");
  await mockApi(page);
  await page.goto("/shipments/history");
  await expect(page.getByRole("heading", { name: "Shipment History" })).toBeVisible();
});

test("customer can open signed-in tracking", async ({ page }) => {
  await useRole(page, "customer");
  await mockApi(page);
  await page.goto("/tracking?trackingId=LN-98742");
  await expect(page.getByPlaceholder("Enter tracking ID")).toHaveValue("LN-98742");
  await expect(page.getByText(/No shipment with this tracking ID/i)).toBeVisible();
});

test("customer can open payment history", async ({ page }) => {
  await useRole(page, "customer");
  await mockApi(page);
  await page.goto("/payments");
  await expect(page.getByRole("heading", { name: "Payments", exact: true })).toBeVisible();
});
test("customer can send a support inquiry", async ({ page }) => {
  await useRole(page, "customer");
  await mockApi(page);
  await page.goto("/inquiries");
  await page.getByRole("button", { name: "New Inquiry" }).click();
  await page.getByPlaceholder("How can our support team help?").fill(
    "Please help me update the delivery instructions.",
  );
  await page.getByRole("button", { name: "Send Inquiry" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Your inquiry was sent to CargoNep Support.",
  );
});

test("customer can review profile and security settings", async ({ page }) => {
  await useRole(page, "customer");
  await mockApi(page);
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Account Settings" })).toBeVisible();
  await expect(page.getByText("Personal Profile")).toBeVisible();
  await page.getByRole("button", { name: "Security", exact: true }).click();
  await expect(page.getByRole("button", { name: "Update Password" })).toBeVisible();
  await expect(page.getByLabel("New Password", { exact: true })).toBeVisible();
});
