"use client";

import { Truck, Zap, SunDim } from "lucide-react";
import { useShipment } from "@/context/ShipmentContext";
import { formatNPR, getServicePrice, INSURANCE_FEE, SPECIAL_HANDLING_FEE } from "@/lib/pricing";

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

  const standardPrice = getServicePrice(packageDetails, "standard");
  const expressPrice = getServicePrice(packageDetails, "express");
  const overnightPrice = getServicePrice(packageDetails, "overnight");

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
      <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--text)] mb-1 uppercase tracking-wider">
          Select Delivery Service
        </h2>
        <p className="text-[11px] text-[var(--text-muted)] mb-5">
          Choose the speed and cost that fits your delivery window.
        </p>

        <div className="space-y-3">
          <div
            onClick={() => setSelectedService("standard")}
            className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center justify-between select-none ${
              selectedService === "standard"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
            }`}
          >
            <div className="flex items-center gap-4.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Truck className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-[14px] font-bold text-[var(--text)]">
                  Standard Delivery
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Reliable 3-5 business day delivery
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[14px] font-extrabold text-[var(--text)] block">
                {formatNPR(standardPrice)}
              </span>
              <span className="text-[10px] font-medium text-[var(--text-muted)] block mt-0.5">
                {standardEta}
              </span>
            </div>
          </div>

          <div
            onClick={() => setSelectedService("express")}
            className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center justify-between select-none ${
              selectedService === "express"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
            }`}
          >
            <div className="flex items-center gap-4.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Zap className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center">
                  <h3 className="text-[14px] font-bold text-[var(--text)]">
                    Express Courier
                  </h3>
                  <span className="bg-[var(--accent)] text-[var(--accent-strong)] text-[8px] font-bold px-1.5 py-0.5 rounded ml-2 select-none uppercase tracking-wider">
                    Popular
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Fast 1-2 business day delivery
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[14px] font-extrabold text-[var(--text)] block">
                {formatNPR(expressPrice)}
              </span>
              <span className="text-[10px] font-medium text-[var(--text-muted)] block mt-0.5">
                {expressEta}
              </span>
            </div>
          </div>

          <div
            onClick={() => setSelectedService("overnight")}
            className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center justify-between select-none ${
              selectedService === "overnight"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
            }`}
          >
            <div className="flex items-center gap-4.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--info-soft)] text-[var(--info)]">
                <SunDim className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-[14px] font-bold text-[var(--text)]">
                  Premium Overnight
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Guaranteed next day by 10:00 AM
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[14px] font-extrabold text-[var(--text)] block">
                {formatNPR(overnightPrice)}
              </span>
              <span className="text-[10px] font-medium text-[var(--text-muted)] block mt-0.5">
                {overnightEta}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--text)] mb-4 uppercase tracking-wider">
          Additional Options
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label
            className={`border rounded-xl p-4.5 flex items-start gap-3.5 cursor-pointer select-none transition-all duration-200 ${
              insurance
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
            }`}
          >
            <input
              type="checkbox"
              checked={insurance}
              onChange={(e) => setInsurance(e.target.checked)}
              className="w-4.5 h-4.5 rounded border-[var(--border-strong)] text-[var(--accent-strong)] focus:ring-[var(--accent)] accent-[var(--accent)] cursor-pointer mt-0.5"
              suppressHydrationWarning
            />
            <div>
              <span className="text-[13px] font-bold text-[var(--text)] block leading-tight">
                Shipping Insurance
              </span>
              <span className="text-[11px] text-[var(--text-muted)] leading-normal mt-1 block">
                Protect against loss or damage up to Rs 50,000.
              </span>
              <span className="text-[10px] font-bold text-[var(--accent-strong)] mt-2 block">
                +{formatNPR(INSURANCE_FEE)}
              </span>
            </div>
          </label>

          <label
            className={`border rounded-xl p-4.5 flex items-start gap-3.5 cursor-pointer select-none transition-all duration-200 ${
              specialHandling
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
            }`}
          >
            <input
              type="checkbox"
              checked={specialHandling}
              onChange={(e) => setSpecialHandling(e.target.checked)}
              className="w-4.5 h-4.5 rounded border-[var(--border-strong)] text-[var(--accent-strong)] focus:ring-[var(--accent)] accent-[var(--accent)] cursor-pointer mt-0.5"
              suppressHydrationWarning
            />
            <div>
              <span className="text-[13px] font-bold text-[var(--text)] block leading-tight">
                Special Handling
              </span>
              <span className="text-[11px] text-[var(--text-muted)] leading-normal mt-1 block">
                For fragile or oversized items requiring manual sorting.
              </span>
              <span className="text-[10px] font-bold text-[var(--accent-strong)] mt-2 block">
                +{formatNPR(SPECIAL_HANDLING_FEE)}
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-[var(--accent-soft)] bg-[var(--accent-soft)] p-4">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-[var(--accent-soft)] text-[var(--accent-strong)] text-[11px] font-bold select-none">
          i
        </div>
        <p className="text-[11px] font-medium text-[var(--text-soft)] leading-relaxed">
          All services include real-time GPS tracking and digital proof of delivery. Prices are calculated based on your parcel weight and dimensions. Estimated dates are based on current logistics capacity.
        </p>
      </div>
    </div>
  );
}
