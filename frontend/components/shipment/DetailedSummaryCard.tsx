"use client";

import { FileText, Shield, Wrench } from "lucide-react";
import { useShipment } from "@/context/ShipmentContext";
import { calculatePrices, formatNPR } from "@/lib/pricing";

const SERVICE_LABELS = {
  standard: "Standard Delivery",
  express: "Express Courier",
  overnight: "Premium Overnight",
};

export function DetailedSummaryCard() {
  const {
    pickupAddress,
    deliveryAddress,
    packageDetails,
    selectedService,
    insurance,
    specialHandling,
  } = useShipment();

  const pickupStreet = pickupAddress.streetAddress || "—";
  const pickupCityLine = [pickupAddress.city, pickupAddress.district]
    .filter(Boolean)
    .join(", ") || "—";

  const deliveryStreet = deliveryAddress.streetAddress || "—";
  const deliveryCityLine = [deliveryAddress.city, deliveryAddress.district]
    .filter(Boolean)
    .join(", ") || "—";

  const weightDisplay = packageDetails.weight
    ? `${packageDetails.weight} kg`
    : "—";

  const dimensionsDisplay =
    packageDetails.dimensions.length &&
    packageDetails.dimensions.width &&
    packageDetails.dimensions.height
      ? `${packageDetails.dimensions.length} × ${packageDetails.dimensions.width} × ${packageDetails.dimensions.height} cm`
      : "—";

  const prices = calculatePrices(packageDetails, selectedService, insurance, specialHandling);

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-5 w-5 text-[var(--accent-strong)]" />
        <h2 className="text-[17px] font-bold text-[var(--text)]">
          Shipment Summary
        </h2>
      </div>

      <div className="space-y-0.5">
        <div className="flex gap-4">
          <div className="flex flex-col items-center shrink-0">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
            </div>
            <div className="flex-1 w-[1.5px] border-l-2 border-dashed border-[var(--border)] my-1 h-12" />
          </div>
          <div className="pb-5">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              PICKUP FROM
            </p>
            <p className="text-[13px] font-bold text-[var(--text)] leading-tight">
              {pickupStreet}
            </p>
            <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-0.5">
              {pickupCityLine}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center shrink-0">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--danger-soft)] border border-[var(--danger-border)]">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--danger-soft)]0" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              DELIVER TO
            </p>
            <p className="text-[13px] font-bold text-[var(--text)] leading-tight">
              {deliveryStreet}
            </p>
            <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-0.5">
              {deliveryCityLine}
            </p>
          </div>
        </div>
      </div>

      <div className="h-5" />

      <div className="space-y-3.5 my-5 text-[13px] border-t border-[var(--border)] pt-5">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)] font-medium">Parcel Type</span>
          <span className="font-bold text-[var(--text)] capitalize">
            {packageDetails.parcelType === "fragile"
              ? "Fragile / High Value"
              : packageDetails.parcelType === "pallet"
              ? "Pallet / Bulk"
              : "Standard Box"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)] font-medium">Parcel Weight</span>
          <span className="font-bold text-[var(--text)]">{weightDisplay}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)] font-medium">Dimensions</span>
          <span className="font-bold text-[var(--text)]">{dimensionsDisplay}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)] font-medium">Quantity</span>
          <span className="font-bold text-[var(--text)]">{packageDetails.quantity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)] font-medium">Service Type</span>
          <span className="font-bold text-[var(--text)]">{SERVICE_LABELS[selectedService]}</span>
        </div>

        <div className="border-t border-[var(--border)] pt-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] font-medium">Shipping Fee</span>
            <span className="font-bold text-[var(--text)]">{formatNPR(prices.shippingFee)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] font-medium">Fuel Surcharge</span>
            <span className="font-bold text-[var(--text)]">{formatNPR(prices.fuelSurcharge)}</span>
          </div>
          {insurance && (
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[var(--accent-strong)]" />
                Insurance
              </span>
              <span className="font-bold text-[var(--text)]">{formatNPR(prices.insuranceFee)}</span>
            </div>
          )}
          {specialHandling && (
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-[var(--accent-hover)]" />
                Special Handling
              </span>
              <span className="font-bold text-[var(--text)]">{formatNPR(prices.handlingFee)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--accent-soft)] border border-[var(--border)] rounded-xl p-4.5 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] font-bold text-[var(--accent-strong)]">
            Estimated Total
          </span>
          <span className="text-[18px] font-extrabold text-[var(--accent-strong)]">
            {formatNPR(prices.total)}
          </span>
        </div>
        <span className="text-[9.5px] text-[var(--accent-strong)] opacity-80 mt-2 block font-medium">
          *Price based on weight, dimensions &amp; selected service
        </span>
      </div>

      <div className="overflow-hidden rounded-lg shadow-sm border border-[var(--border)] relative h-[105px]">
        <svg className="w-full h-full" viewBox="0 0 200 105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="105" fill="var(--border-strong)" />
          <path d="M 5 15 Q 12 8, 20 18 T 35 15 T 45 30 T 30 50 T 20 40 Z" fill="var(--border-strong)" opacity="0.85" />
          <path d="M 60 25 Q 75 18, 90 28 T 105 15 T 120 30 T 110 55 T 85 45 Z" fill="var(--border-strong)" opacity="0.85" />
          <path d="M 130 15 Q 145 10, 160 22 T 180 15 T 195 30 T 175 60 T 150 40 Z" fill="var(--border-strong)" opacity="0.85" />
          <path d="M 25 55 Q 35 62, 30 75 T 45 85 T 35 100 T 15 90 T 10 70 Z" fill="var(--border-strong)" opacity="0.85" />
          <path d="M 125 55 Q 140 60, 135 80 T 150 95 T 130 102 T 115 80 Z" fill="var(--border-strong)" opacity="0.85" />
          <path d="M 45 70 Q 75 50, 95 35" stroke="#E9C46A" strokeWidth="1.8" strokeDasharray="4 3.5" strokeLinecap="round" opacity="0.9" />
          <g transform="translate(45, 70)">
            <circle cx="0" cy="0" r="3" fill="#E9C46A" />
            <path d="M -3 -8 L 3 -8 L 0 0 Z" fill="#E9C46A" />
            <circle cx="0" cy="-8" r="4.5" fill="#E9C46A" />
            <circle cx="0" cy="-8" r="1.8" fill="white" />
          </g>
          <g transform="translate(95, 35)">
            <circle cx="0" cy="0" r="3" fill="#E9C46A" />
            <path d="M -3 -8 L 3 -8 L 0 0 Z" fill="#E9C46A" />
            <circle cx="0" cy="-8" r="4.5" fill="#E9C46A" />
            <circle cx="0" cy="-8" r="1.8" fill="white" />
          </g>
          <g transform="translate(110, 60)">
            <rect x="-11" y="-9" width="22" height="18" rx="3" fill="white" />
            <path d="M -7 -5 L -2 -3 L 3 -5 L 8 -3 M -8 -1 L -3 1 L 2 -1 L 7 1 M -7 3 L -2 5 L 3 3 L 8 5" stroke="var(--accent-hover)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}
