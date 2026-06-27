"use client";

import { FileText } from "lucide-react";
import { useShipment } from "@/context/ShipmentContext";

export function DetailedSummaryCard() {
  const { pickupAddress, deliveryAddress, packageDetails } = useShipment();

  // Format display strings with fallbacks
  const pickupStreet = pickupAddress.streetAddress || "—";
  const pickupCityLine = [pickupAddress.city, pickupAddress.postalCode]
    .filter(Boolean)
    .join(", ") || "—";

  const deliveryStreet = deliveryAddress.streetAddress || "—";
  const deliveryCityLine = [deliveryAddress.city, deliveryAddress.postalCode]
    .filter(Boolean)
    .join(", ") || "—";

  const weightDisplay = packageDetails.weight
    ? `${packageDetails.weight} kg`
    : "—";

  const dimensionsDisplay =
    packageDetails.dimensions.length &&
    packageDetails.dimensions.width &&
    packageDetails.dimensions.height
      ? `${packageDetails.dimensions.length} x ${packageDetails.dimensions.width} x ${packageDetails.dimensions.height} cm`
      : "—";

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-5 w-5 text-[#1D7A8C]" />
        <h2 className="text-[17px] font-bold text-[#1E293B]">
          Shipment Summary
        </h2>
      </div>

      {/* Address Timeline */}
      <div className="space-y-0.5">
        {/* Pickup Address */}
        <div className="flex gap-4">
          {/* Vertical indicator column */}
          <div className="flex flex-col items-center shrink-0">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E5F1F3] border border-[#1D7A8C]/20">
              <div className="h-2.5 w-2.5 rounded-full bg-[#1D7A8C]" />
            </div>
            <div className="flex-1 w-[1.5px] border-l-2 border-dashed border-slate-200 my-1 h-12" />
          </div>

          {/* Address details */}
          <div className="pb-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              PICKUP FROM
            </p>
            <p className="text-[13px] font-bold text-slate-800 leading-tight">
              {pickupStreet}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {pickupCityLine}
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="flex gap-4">
          {/* Vertical indicator column */}
          <div className="flex flex-col items-center shrink-0">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 border border-red-200">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            </div>
          </div>

          {/* Address details */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              DELIVER TO
            </p>
            <p className="text-[13px] font-bold text-slate-800 leading-tight">
              {deliveryStreet}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {deliveryCityLine}
            </p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-5" />

      {/* Price breakdown details */}
      <div className="space-y-3.5 my-5 text-[13px] border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Parcel Type</span>
          <span className="font-bold text-slate-700 capitalize">{packageDetails.parcelType === "fragile" ? "Fragile / High Value" : packageDetails.parcelType === "pallet" ? "Pallet / Bulk" : "Standard Box"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Parcel Weight</span>
          <span className="font-bold text-slate-700">{weightDisplay}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Dimensions</span>
          <span className="font-bold text-slate-700">{dimensionsDisplay}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Quantity</span>
          <span className="font-bold text-slate-700">{packageDetails.quantity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Service Type</span>
          <span className="font-bold text-slate-700">—</span>
        </div>
      </div>

      {/* Estimated Total Card */}
      <div className="bg-[#EAF5F8]/70 border border-[#E2E8F0]/30 rounded-xl p-4.5 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] font-bold text-[#1D7A8C]">
            Estimated Total
          </span>
          <span className="text-[18px] font-extrabold text-[#1D7A8C]">
            $154.50
          </span>
        </div>
        <span className="text-[9.5px] text-[#1D7A8C]/80 mt-2 block font-medium">
          *Final price calculated after dimension verification
        </span>
      </div>

      {/* World Map SVG Visual */}
      <div className="overflow-hidden rounded-lg shadow-sm border border-[#E2E8F0] relative h-[105px]">
        <svg
          className="w-full h-full"
          viewBox="0 0 200 105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background color of map */}
          <rect width="200" height="105" fill="#D5C4A9" />

          {/* Custom Land Mass Paths (Abstract shapes representing standard world outline map) */}
          <path
            d="M 5 15 Q 12 8, 20 18 T 35 15 T 45 30 T 30 50 T 20 40 Z"
            fill="#E2D7C4"
            opacity="0.85"
          />
          <path
            d="M 60 25 Q 75 18, 90 28 T 105 15 T 120 30 T 110 55 T 85 45 Z"
            fill="#E2D7C4"
            opacity="0.85"
          />
          <path
            d="M 130 15 Q 145 10, 160 22 T 180 15 T 195 30 T 175 60 T 150 40 Z"
            fill="#E2D7C4"
            opacity="0.85"
          />
          <path
            d="M 25 55 Q 35 62, 30 75 T 45 85 T 35 100 T 15 90 T 10 70 Z"
            fill="#E2D7C4"
            opacity="0.85"
          />
          <path
            d="M 125 55 Q 140 60, 135 80 T 150 95 T 130 102 T 115 80 Z"
            fill="#E2D7C4"
            opacity="0.85"
          />

          {/* Dotted Route Line connecting two locations */}
          <path
            d="M 45 70 Q 75 50, 95 35"
            stroke="#1D7A8C"
            strokeWidth="1.8"
            strokeDasharray="4 3.5"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Pickup Pin */}
          <g transform="translate(45, 70)">
            <circle cx="0" cy="0" r="3" fill="#1D7A8C" />
            <path d="M -3 -8 L 3 -8 L 0 0 Z" fill="#1D7A8C" />
            <circle cx="0" cy="-8" r="4.5" fill="#1D7A8C" />
            <circle cx="0" cy="-8" r="1.8" fill="white" />
          </g>

          {/* Delivery Pin */}
          <g transform="translate(95, 35)">
            <circle cx="0" cy="0" r="3" fill="#1D7A8C" />
            <path d="M -3 -8 L 3 -8 L 0 0 Z" fill="#1D7A8C" />
            <circle cx="0" cy="-8" r="4.5" fill="#1D7A8C" />
            <circle cx="0" cy="-8" r="1.8" fill="white" />
          </g>

          {/* Folded Map Card Icon in the center */}
          <g transform="translate(110, 60)">
            {/* White card container */}
            <rect
              x="-11"
              y="-9"
              width="22"
              height="18"
              rx="3"
              fill="white"
            />
            {/* Map fold pattern */}
            <path
              d="M -7 -5 L -2 -3 L 3 -5 L 8 -3 M -8 -1 L -3 1 L 2 -1 L 7 1 M -7 3 L -2 5 L 3 3 L 8 5"
              stroke="#D5A021"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
