import type { ServiceType, PackageDetails } from "@/context/ShipmentContext";

/**
 * Pricing tiers based on parcel weight (kg). Amounts are in Nepali Rupees (NPR),
 * tuned for affordable domestic delivery across Nepal.
 *
 * ≤ 10 kg   → base Rs 150
 * 10–50 kg  → base Rs 450
 * 50–100 kg → base Rs 900
 * > 100 kg  → base Rs 1,800
 */
function getWeightBase(weight: number): number {
  if (weight <= 0) return 80; // fallback for empty/zero
  if (weight <= 10) return 150;
  if (weight <= 50) return 450;
  if (weight <= 100) return 900;
  return 1800;
}

/**
 * Dimension surcharge (NPR) — based on cubic volume (cm³).
 *
 * ≤ 10,000 cm³  (small)   → +Rs 0
 * 10,001–50,000 cm³       → +Rs 50
 * 50,001–200,000 cm³      → +Rs 150
 * > 200,000 cm³ (large)   → +Rs 300
 */
function getDimensionSurcharge(dims: { length: string; width: string; height: string }): number {
  const l = parseFloat(dims.length) || 0;
  const w = parseFloat(dims.width) || 0;
  const h = parseFloat(dims.height) || 0;
  const volume = l * w * h;

  if (volume <= 0) return 0;
  if (volume <= 10_000) return 0;
  if (volume <= 50_000) return 50;
  if (volume <= 200_000) return 150;
  return 300;
}

/**
 * Service multiplier applied on the base price.
 *
 * Standard  → 1×
 * Express   → 1.5×
 * Overnight → 2.5×
 */
const SERVICE_MULTIPLIER: Record<ServiceType, number> = {
  standard: 1,
  express: 1.5,
  overnight: 2.5,
};

/**
 * Fuel surcharge as a percentage of the shipping fee.
 */
const FUEL_PERCENT: Record<ServiceType, number> = {
  standard: 0.06,
  express: 0.08,
  overnight: 0.1,
};

// ── Fixed add-on fees (NPR) ──────────────────
export const INSURANCE_FEE = 100;
export const SPECIAL_HANDLING_FEE = 60;

/**
 * Formats an amount as Nepali Rupees, e.g. 150000 → "Rs 1,50,000".
 * Uses the South-Asian (lakh) digit grouping used in Nepal.
 */
export function formatNPR(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString("en-IN")}`;
}

// ── Public API ───────────────────────────────

export interface PriceBreakdown {
  /** Base shipping fee (weight + dimension + service multiplier × quantity) */
  shippingFee: number;
  /** Fuel surcharge */
  fuelSurcharge: number;
  /** Insurance fee (0 if not selected) */
  insuranceFee: number;
  /** Special handling fee (0 if not selected) */
  handlingFee: number;
  /** Grand total */
  total: number;
}

export function calculatePrices(
  packageDetails: PackageDetails,
  service: ServiceType,
  hasInsurance: boolean,
  hasSpecialHandling: boolean,
): PriceBreakdown {
  const weight = parseFloat(packageDetails.weight) || 0;
  const weightBase = getWeightBase(weight);
  const dimSurcharge = getDimensionSurcharge(packageDetails.dimensions);
  const multiplier = SERVICE_MULTIPLIER[service];

  const shippingFee = Math.round(
    (weightBase + dimSurcharge) * multiplier * packageDetails.quantity,
  );

  const fuelSurcharge = Math.round(shippingFee * FUEL_PERCENT[service]);

  const insuranceFee = hasInsurance ? INSURANCE_FEE : 0;
  const handlingFee = hasSpecialHandling ? SPECIAL_HANDLING_FEE : 0;

  const total = shippingFee + fuelSurcharge + insuranceFee + handlingFee;

  return { shippingFee, fuelSurcharge, insuranceFee, handlingFee, total };
}

/**
 * Returns the price for a single service option card (used in SelectServiceCard).
 * Ignores add-ons — just shows the shipping fee for that service.
 */
export function getServicePrice(
  packageDetails: PackageDetails,
  service: ServiceType,
): number {
  const weight = parseFloat(packageDetails.weight) || 0;
  const weightBase = getWeightBase(weight);
  const dimSurcharge = getDimensionSurcharge(packageDetails.dimensions);
  const multiplier = SERVICE_MULTIPLIER[service];
  return Math.round(
    (weightBase + dimSurcharge) * multiplier * packageDetails.quantity,
  );
}
