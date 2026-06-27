"use client";

import { Truck, Zap, SunDim } from "lucide-react";
import { useShipment } from "@/context/ShipmentContext";
import { getServicePrice, INSURANCE_FEE, SPECIAL_HANDLING_FEE } from "@/lib/pricing";

export function SelectServiceCard() {
  const {
    selectedService,
    setSelectedService,
    insurance,
    setInsurance,
    specialHandling,
    setSpecialHandling,
    packageDetails,
  } = useShipment();

  // Dynamic prices based on weight + dimensions
  const standardPrice = getServicePrice(packageDetails, "standard");
  const expressPrice = getServicePrice(packageDetails, "express");
  const overnightPrice = getServicePrice(packageDetails, "overnight");

  // Estimated delivery date helpers
  const today = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const addDays = (days: number) =>
    new Date(today.getTime() + days * 86_400_000);

  const standardEta = `Est: ${fmt(addDays(3))} – ${fmt(addDays(5))}`;
  const expressEta = `Est: ${fmt(addDays(1))} – ${fmt(addDays(2))}`;
  const overnightEta = `Est: Tomorrow, ${fmt(addDays(1))}`;

  return (
    <div className="space-y-6">
      {/* Select Delivery Service Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-1 uppercase tracking-wider">
          Select Delivery Service
        </h2>
        <p className="text-[11px] text-slate-500 mb-5">
          Choose the speed and cost that fits your delivery window.
        </p>

        {/* Vertical Stacked Delivery Options */}
        <div className="space-y-3">
          {/* Option 1: Standard Delivery */}
          <div
            onClick={() => setSelectedService("standard")}
            className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center justify-between select-none ${
              selectedService === "standard"
                ? "border-[#1D7A8C] bg-[#EAF5F8]/30"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-4.5">
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF1FF] text-purple-600">
                <Truck className="h-5 w-5" />
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">
                  Standard Delivery
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Reliable 3-5 business day delivery
                </p>
              </div>
            </div>

            {/* Price & Est Date */}
            <div className="text-right">
              <span className="text-[14px] font-extrabold text-slate-800 block">
                ${standardPrice.toFixed(2)}
              </span>
              <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                {standardEta}
              </span>
            </div>
          </div>

          {/* Option 2: Express Courier */}
          <div
            onClick={() => setSelectedService("express")}
            className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center justify-between select-none ${
              selectedService === "express"
                ? "border-[#1D7A8C] bg-[#EAF5F8]/30"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-4.5">
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF5F8] text-[#1D7A8C]">
                <Zap className="h-5 w-5" />
              </div>

              {/* Title & Desc */}
              <div>
                <div className="flex items-center">
                  <h3 className="text-[14px] font-bold text-slate-800">
                    Express Courier
                  </h3>
                  <span className="bg-[#E9C46A] text-[#3A2E12] text-[8px] font-bold px-1.5 py-0.5 rounded ml-2 select-none uppercase tracking-wider">
                    Popular
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Fast 1-2 business day delivery
                </p>
              </div>
            </div>

            {/* Price & Est Date */}
            <div className="text-right">
              <span className="text-[14px] font-extrabold text-slate-800 block">
                ${expressPrice.toFixed(2)}
              </span>
              <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                {expressEta}
              </span>
            </div>
          </div>

          {/* Option 3: Premium Overnight */}
          <div
            onClick={() => setSelectedService("overnight")}
            className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center justify-between select-none ${
              selectedService === "overnight"
                ? "border-[#1D7A8C] bg-[#EAF5F8]/30"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-4.5">
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <SunDim className="h-5 w-5" />
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">
                  Premium Overnight
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Guaranteed next day by 10:00 AM
                </p>
              </div>
            </div>

            {/* Price & Est Date */}
            <div className="text-right">
              <span className="text-[14px] font-extrabold text-slate-800 block">
                ${overnightPrice.toFixed(2)}
              </span>
              <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                {overnightEta}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Options Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
          Additional Options
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shipping Insurance */}
          <label
            className={`border rounded-xl p-4.5 flex items-start gap-3.5 cursor-pointer select-none transition-all duration-200 ${
              insurance
                ? "border-[#1D7A8C] bg-[#EAF5F8]/20"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={insurance}
              onChange={(e) => setInsurance(e.target.checked)}
              className="w-4.5 h-4.5 rounded border-slate-300 text-[#1D7A8C] focus:ring-[#1D7A8C] accent-[#1D7A8C] cursor-pointer mt-0.5"
              suppressHydrationWarning
            />
            <div>
              <span className="text-[13px] font-bold text-slate-800 block leading-tight">
                Shipping Insurance
              </span>
              <span className="text-[11px] text-slate-500 leading-normal mt-1 block">
                Protect against loss or damage up to $5,000.
              </span>
              <span className="text-[10px] font-bold text-[#1D7A8C] mt-2 block">
                +${INSURANCE_FEE.toFixed(2)}
              </span>
            </div>
          </label>

          {/* Special Handling */}
          <label
            className={`border rounded-xl p-4.5 flex items-start gap-3.5 cursor-pointer select-none transition-all duration-200 ${
              specialHandling
                ? "border-[#1D7A8C] bg-[#EAF5F8]/20"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={specialHandling}
              onChange={(e) => setSpecialHandling(e.target.checked)}
              className="w-4.5 h-4.5 rounded border-slate-300 text-[#1D7A8C] focus:ring-[#1D7A8C] accent-[#1D7A8C] cursor-pointer mt-0.5"
              suppressHydrationWarning
            />
            <div>
              <span className="text-[13px] font-bold text-slate-800 block leading-tight">
                Special Handling
              </span>
              <span className="text-[11px] text-slate-500 leading-normal mt-1 block">
                For fragile or oversized items requiring manual sorting.
              </span>
              <span className="text-[10px] font-bold text-[#1D7A8C] mt-2 block">
                +${SPECIAL_HANDLING_FEE.toFixed(2)}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Info Banner Disclaimer */}
      <div className="flex gap-3 rounded-xl border border-[#E9E3FF] bg-[#F4F3FF]/40 p-4">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-[#E9E3FF] text-[#6C63FF] text-[11px] font-bold select-none">
          i
        </div>
        <p className="text-[11px] font-medium text-[#6B668B] leading-relaxed">
          All services include real-time GPS tracking and digital proof of delivery. Prices are calculated based on your parcel weight and dimensions. Estimated dates are based on current logistics capacity.
        </p>
      </div>
    </div>
  );
}