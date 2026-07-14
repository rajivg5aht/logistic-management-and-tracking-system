import type { ServiceType, PackageDetails } from "@/context/ShipmentContext";

function getWeightBase(weight: number): number {
  if (weight <= 0) return 80;
  if (weight <= 10) return 150;
  if (weight <= 50) return 450;
  if (weight <= 100) return 900;
  return 1800;
}

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

const SERVICE_MULTIPLIER: Record<ServiceType, number> = {
  standard: 1,
  express: 1.5,
  overnight: 2.5,
};

const FUEL_PERCENT: Record<ServiceType, number> = {
  standard: 0.06,
  express: 0.08,
  overnight: 0.1,
};

export const INSURANCE_FEE = 100;
export const SPECIAL_HANDLING_FEE = 60;

export function formatNPR(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString("en-IN")}`;
}

export interface PriceBreakdown {
  shippingFee: number;
  fuelSurcharge: number;
  insuranceFee: number;
  handlingFee: number;
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
