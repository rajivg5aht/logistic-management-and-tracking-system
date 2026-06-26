"use client";

import { useState } from "react";
import { Truck, Zap, SunDim } from "lucide-react";

export function SelectServiceCard() {
  const [selectedService, setSelectedService] = useState<"standard" | "express" | "overnight">("express");
  const [insurance, setInsurance] = useState(false);
  const [specialHandling, setSpecialHandling] = useState(false);

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
                $24.50
              </span>
              <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                Est: Oct 28 - Oct 30
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
                $48.00
              </span>
              <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                Est: Oct 25 - Oct 26
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
                $82.15
              </span>
              <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                Est: Tomorrow, Oct 24
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
          <label className="border border-[#E2E8F0] hover:border-slate-300 rounded-xl p-4.5 flex items-start gap-3.5 cursor-pointer bg-white select-none">
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
                +$5.00 Base + 0.5% Value
              </span>
            </div>
          </label>

          {/* Special Handling */}
          <label className="border border-[#E2E8F0] hover:border-slate-300 rounded-xl p-4.5 flex items-start gap-3.5 cursor-pointer bg-white select-none">
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
                +$12.50 Flat Fee
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
          All services include real-time GPS tracking and digital proof of delivery. Estimated dates are based on current logistics capacity and transit schedules.
        </p>
      </div>
    </div>
  );
}