"use client";

import { useShipment } from "@/context/ShipmentContext";
import { calculatePrices } from "@/lib/pricing";
import {
  MapPin,
  Package,
  CreditCard,
  Plus,
  Check,
  Zap,
  Truck,
  SunDim,
  Shield,
  Wrench,
} from "lucide-react";
import { useState } from "react";

const SERVICE_INFO = {
  standard: {
    label: "Standard Delivery",
    eta: "3-5 Business Days",
    features: ["GPS Tracking Included", "Proof of Delivery", "Email Notifications"],
    icon: Truck,
    iconBg: "bg-[#EEF1FF]",
    iconColor: "text-purple-600",
  },
  express: {
    label: "Priority Express",
    eta: "1-2 Business Days",
    features: ["Guaranteed Next-Day", "Real-time GPS Tracking", "Signature Required"],
    icon: Zap,
    iconBg: "bg-[#EAF5F8]",
    iconColor: "text-[#1D7A8C]",
  },
  overnight: {
    label: "Premium Overnight",
    eta: "Next Day by 10:00 AM",
    features: ["Guaranteed by 10 AM", "Priority Handling", "Signature Required"],
    icon: SunDim,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
};

const PAYMENT_METHODS = [
  {
    id: "visa",
    brand: "VISA",
    brandColor: "bg-[#1A1F71]",
    brandText: "text-white",
    label: "Visa Corporate Platinum",
    ending: "4242",
    expires: "12/26",
  },
  {
    id: "mc",
    brand: "MC",
    brandColor: "bg-[#EB001B]",
    brandText: "text-white",
    label: "Mastercard Business",
    ending: "8801",
    expires: "08/25",
  },
];

export function ReviewAndPayCard({
  onEditStep,
}: {
  onEditStep: (step: number) => void;
}) {
  const {
    pickupAddress,
    deliveryAddress,
    packageDetails,
    selectedService,
    insurance,
    specialHandling,
  } = useShipment();

  const [selectedPayment, setSelectedPayment] = useState("visa");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const service = SERVICE_INFO[selectedService];
  const ServiceIcon = service.icon;

  // Dynamic price calculation from shared utility
  const prices = calculatePrices(packageDetails, selectedService, insurance, specialHandling);

  // Generate a reference number
  const refNumber = `CARGO-${Date.now().toString(36).toUpperCase().slice(-6)}-X`;

  // Estimated delivery date
  const today = new Date();
  const daysToAdd = selectedService === "overnight" ? 1 : selectedService === "express" ? 2 : 5;
  const estDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  const estDateStr = estDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Format helpers
  const pickupCityLine = [pickupAddress.city, pickupAddress.postalCode]
    .filter(Boolean)
    .join(", ");
  const deliveryCityLine = [deliveryAddress.city, deliveryAddress.postalCode]
    .filter(Boolean)
    .join(", ");

  const parcelTypeLabel =
    packageDetails.parcelType === "fragile"
      ? "Fragile Parcel"
      : packageDetails.parcelType === "pallet"
      ? "Bulk Pallet"
      : "Standard Parcel";

  const weightDisplay = packageDetails.weight
    ? `${packageDetails.weight} kg total`
    : "—";

  const dimensionsDisplay =
    packageDetails.dimensions.length &&
    packageDetails.dimensions.width &&
    packageDetails.dimensions.height
      ? `${packageDetails.dimensions.length} × ${packageDetails.dimensions.width} × ${packageDetails.dimensions.height} cm`
      : "—";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── LEFT COLUMN ── */}
      <div className="lg:col-span-3 space-y-5">
        {/* ─── Shipping Route ─── */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF5F8]">
                <MapPin className="h-4 w-4 text-[#1D7A8C]" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800">
                Shipping Route
              </h3>
            </div>
            <button
              onClick={() => onEditStep(1)}
              className="text-[12px] font-bold text-[#1D7A8C] hover:text-[#15616D] transition-colors cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Pickup */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2">
                Pickup From
              </p>
              <p className="text-[14px] font-bold text-slate-800 leading-snug">
                {pickupAddress.fullName || "—"}
              </p>
              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {pickupAddress.streetAddress || "—"}
                <br />
                {pickupCityLine || "—"}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Contact: {pickupAddress.fullName || "—"}
              </p>
            </div>

            {/* Delivery */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2">
                Deliver To
              </p>
              <p className="text-[14px] font-bold text-slate-800 leading-snug">
                {deliveryAddress.recipientName || "—"}
              </p>
              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {deliveryAddress.streetAddress || "—"}
                <br />
                {deliveryCityLine || "—"}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Contact: {deliveryAddress.recipientName || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Shipment Contents ─── */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF8E1]">
                <Package className="h-4 w-4 text-[#D5A021]" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800">
                Shipment Contents
              </h3>
            </div>
            <button
              onClick={() => onEditStep(2)}
              className="text-[12px] font-bold text-[#1D7A8C] hover:text-[#15616D] transition-colors cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="flex items-center gap-5 flex-wrap">
            {/* Package icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F8F7F4] border border-[#E2E8F0]">
              <Package className="h-6 w-6 text-slate-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 flex-1">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Type
                </p>
                <p className="text-[13px] font-bold text-slate-700 mt-0.5">
                  {parcelTypeLabel}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quantity
                </p>
                <p className="text-[13px] font-bold text-slate-700 mt-0.5">
                  {packageDetails.quantity} {packageDetails.quantity === 1 ? "Item" : "Items"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Weight
                </p>
                <p className="text-[13px] font-bold text-slate-700 mt-0.5">
                  {weightDisplay}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Dimensions
                </p>
                <p className="text-[13px] font-bold text-slate-700 mt-0.5">
                  {dimensionsDisplay}
                </p>
              </div>
            </div>
          </div>

          {/* Insurance callout */}
          {insurance && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#1D7A8C]" />
                <span className="text-[12px] font-semibold text-slate-600">
                  Full Value Insurance Coverage (Up to $5,000 USD)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ─── Payment Method ─── */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F3EEFF]">
              <CreditCard className="h-4 w-4 text-purple-500" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-800">
              Payment Method
            </h3>
          </div>

          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                  selectedPayment === method.id
                    ? "border-[#1D7A8C] bg-[#EAF5F8]/20"
                    : "border-[#E2E8F0] bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Radio */}
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedPayment === method.id
                        ? "border-[#1D7A8C] bg-[#1D7A8C]"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedPayment === method.id && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Brand badge */}
                  <div
                    className={`${method.brandColor} ${method.brandText} text-[10px] font-bold px-2.5 py-1.5 rounded-md tracking-wider`}
                  >
                    {method.brand}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">
                      {method.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ending in {method.ending} • Expires {method.expires}
                    </p>
                  </div>
                </div>

                {/* Check icon for selected */}
                {selectedPayment === method.id && (
                  <div className="h-6 w-6 rounded-full bg-[#1D7A8C] flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </label>
            ))}
          </div>

          {/* Add new */}
          <button className="mt-4 flex items-center gap-2 text-[12px] font-bold text-[#1D7A8C] hover:text-[#15616D] transition-colors cursor-pointer">
            <Plus className="h-4 w-4" />
            Add New Payment Method
          </button>
        </div>

        {/* ─── Terms & Agreement ─── */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 rounded-full border-slate-300 text-[#1D7A8C] accent-[#1D7A8C] cursor-pointer mt-0.5 shrink-0"
            />
            <p className="text-[12px] text-slate-500 leading-relaxed">
              I agree to the{" "}
              <span className="font-semibold text-slate-700 underline underline-offset-2 cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="font-semibold text-slate-700 underline underline-offset-2 cursor-pointer">
                Shipping Policy
              </span>
              . I understand that shipment details cannot be modified once payment is processed.
            </p>
          </label>
        </div>
      </div>

      {/* ── RIGHT COLUMN (Sidebar) ── */}
      <div className="lg:col-span-2 space-y-5">
        {/* ─── Order Summary ─── */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          {/* Accent Header */}
          <div className="bg-gradient-to-r from-[#1D7A8C] to-[#15616D] px-6 py-4">
            <h3 className="text-[15px] font-bold text-white">Order Summary</h3>
            <p className="text-[11px] font-medium text-white/70 mt-0.5">
              Ref: {refNumber}
            </p>
          </div>

          <div className="p-6">
            {/* Line items */}
            <div className="space-y-3.5 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">
                  Shipping Fee ({service.label})
                </span>
                <span className="font-bold text-slate-700">
                  ${prices.shippingFee.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fuel Surcharge</span>
                <span className="font-bold text-slate-700">
                  ${prices.fuelSurcharge.toFixed(2)}
                </span>
              </div>
              {insurance && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Insurance (Standard + Extra)</span>
                  <span className="font-bold text-slate-700">
                    ${prices.insuranceFee.toFixed(2)}
                  </span>
                </div>
              )}
              {specialHandling && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Handling &amp; Processing</span>
                  <span className="font-bold text-slate-700">
                    ${prices.handlingFee.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-5" />

            {/* Total */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Amount
                </p>
                <p className="text-[28px] font-extrabold text-slate-800 leading-none mt-1">
                  ${prices.total.toFixed(2)}
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#1D7A8C] bg-[#EAF5F8] px-2.5 py-1 rounded-md mb-1">
                USD
              </span>
            </div>
          </div>
        </div>

        {/* ─── Service Info Card ─── */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${service.iconBg}`}>
              <ServiceIcon className={`h-5 w-5 ${service.iconColor}`} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800">
                {service.label}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Estimated Delivery: {estDateStr}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {service.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded-full bg-[#E6F7ED] flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
                </div>
                <span className="text-[12px] font-medium text-slate-600">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Route Map ─── */}
        <div className="overflow-hidden rounded-xl shadow-sm border border-[#E2E8F0]">
          <div className="relative h-[140px]">
            <svg
              className="w-full h-full"
              viewBox="0 0 320 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Background */}
              <rect width="320" height="140" fill="#D5C4A9" />

              {/* Land masses */}
              <path
                d="M 10 20 Q 25 10, 40 25 T 65 20 T 80 40 T 60 65 T 35 55 Z"
                fill="#E2D7C4"
                opacity="0.85"
              />
              <path
                d="M 95 30 Q 120 20, 150 35 T 175 22 T 200 40 T 185 70 T 145 60 Z"
                fill="#E2D7C4"
                opacity="0.85"
              />
              <path
                d="M 215 20 Q 240 12, 265 28 T 295 20 T 315 40 T 290 75 T 250 55 Z"
                fill="#E2D7C4"
                opacity="0.85"
              />
              <path
                d="M 40 75 Q 55 85, 50 100 T 70 115 T 55 130 T 25 120 T 15 95 Z"
                fill="#E2D7C4"
                opacity="0.85"
              />
              <path
                d="M 210 75 Q 230 80, 225 105 T 245 125 T 220 132 T 195 105 Z"
                fill="#E2D7C4"
                opacity="0.85"
              />

              {/* Route line */}
              <path
                d="M 75 90 Q 130 55, 170 45"
                stroke="#1D7A8C"
                strokeWidth="2"
                strokeDasharray="5 4"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Waypoint dots */}
              <circle cx="100" cy="72" r="3" fill="#1D7A8C" opacity="0.5" />
              <circle cx="130" cy="58" r="3" fill="#1D7A8C" opacity="0.5" />
              <circle cx="150" cy="50" r="3" fill="#1D7A8C" opacity="0.5" />

              {/* Pickup Pin */}
              <g transform="translate(75, 90)">
                <circle cx="0" cy="0" r="3.5" fill="#1D7A8C" />
                <path d="M -3.5 -9 L 3.5 -9 L 0 0 Z" fill="#1D7A8C" />
                <circle cx="0" cy="-9" r="5" fill="#1D7A8C" />
                <circle cx="0" cy="-9" r="2" fill="white" />
              </g>

              {/* Delivery Pin */}
              <g transform="translate(170, 45)">
                <circle cx="0" cy="0" r="3.5" fill="#1D7A8C" />
                <path d="M -3.5 -9 L 3.5 -9 L 0 0 Z" fill="#1D7A8C" />
                <circle cx="0" cy="-9" r="5" fill="#1D7A8C" />
                <circle cx="0" cy="-9" r="2" fill="white" />
              </g>
            </svg>

            {/* Route label overlay */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-[#E2E8F0]">
              <p className="text-[11px] font-bold text-slate-800">
                {pickupAddress.city || "Origin"} → {deliveryAddress.city || "Dest"}
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">
                Direct Shipping Route
              </p>
            </div>
          </div>
        </div>

        {/* ─── Confirm Button ─── */}
        <button
          disabled={!agreedToTerms}
          className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-all duration-200 cursor-pointer shadow-sm ${
            agreedToTerms
              ? "bg-gradient-to-r from-[#1D7A8C] to-[#15616D] text-white hover:shadow-md hover:shadow-[#1D7A8C]/20 active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Confirm &amp; Pay ${prices.total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
