import type { ServiceType, PackageDetails } from "@/context/ShipmentContext";

/**
 * Pricing tiers based on parcel weight (kg).
 *
 * ≤ 10 kg  → base $100
 * 10–50 kg → base $250
 * 50–100 kg → base $500
 * > 100 kg → base $1,000
 */
function getWeightBase(weight: number): number {
  if (weight <= 0) return 50; // fallback for empty/zero
  if (weight <= 10) return 100;
  if (weight <= 50) return 250;
  if (weight <= 100) return 500;
  return 1000;
}

/**
 * Dimension surcharge — based on cubic volume (cm³).
 *
 * ≤ 10,000 cm³  (small)   → +$0
 * 10,001–50,000 cm³       → +$25
 * 50,001–200,000 cm³      → +$75
 * > 200,000 cm³ (large)   → +$150
 */
function getDimensionSurcharge(dims: { length: string; width: string; height: string }): number {
  const l = parseFloat(dims.length) || 0;
  const w = parseFloat(dims.width) || 0;
  const h = parseFloat(dims.height) || 0;
  const volume = l * w * h;

  if (volume <= 0) return 0;
  if (volume <= 10_000) return 0;
  if (volume <= 50_000) return 25;
  if (volume <= 200_000) return 75;
  return 150;
}

/**
 * Service multiplier applied on the base price.
 *
 * Standard  → 1×
 * Express   → 1.8×
 * Overnight → 3×
 */
const SERVICE_MULTIPLIER: Record<ServiceType, number> = {
  standard: 1,
  express: 1.8,
  overnight: 3,
};

/**
 * Fuel surcharge as a percentage of the shipping fee.
 */
const FUEL_PERCENT: Record<ServiceType, number> = {
  standard: 0.06,
  express: 0.08,
  overnight: 0.1,
};

// ── Fixed add-on fees ────────────────────────
export const INSURANCE_FEE = 25.0;
export const SPECIAL_HANDLING_FEE = 12.5;

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

  const shippingFee = parseFloat(
    ((weightBase + dimSurcharge) * multiplier * packageDetails.quantity).toFixed(2),
  );

  const fuelSurcharge = parseFloat(
    (shippingFee * FUEL_PERCENT[service]).toFixed(2),
  );

  const insuranceFee = hasInsurance ? INSURANCE_FEE : 0;
  const handlingFee = hasSpecialHandling ? SPECIAL_HANDLING_FEE : 0;

  const total = parseFloat(
    (shippingFee + fuelSurcharge + insuranceFee + handlingFee).toFixed(2),
  );

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
  return parseFloat(
    ((weightBase + dimSurcharge) * multiplier * packageDetails.quantity).toFixed(2),
  );
}
