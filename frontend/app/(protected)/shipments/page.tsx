"use client";

import { useState } from "react";
import { StepProgressBar } from "@/components/shipment/StepProgressBar";
import { PickupAddressCard } from "@/components/shipment/PickupAddressCard";
import { DeliveryAddressCard } from "@/components/shipment/DeliveryAddressCard";
import { ParcelDetailsCard } from "@/components/shipment/ParcelDetailsCard";
import { MapPanel } from "@/components/shipment/MapPanel";
import { ShipmentSummaryCard } from "@/components/shipment/ShipmentSummaryCard";

export default function CreateShipmentPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, label: "Addresses", active: currentStep === 1 },
    { number: 2, label: "Package Details", active: currentStep === 2 },
    { number: 3, label: "Service Type", active: currentStep === 3 },
    { number: 4, label: "Review & Pay", active: currentStep === 4 },
  ];

  return (
    <div className="space-y-6">
      {/* Step Progress Bar */}
      <div className="py-2">
        <StepProgressBar steps={steps} />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Area (Spans 2 columns on lg screens) */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pickup Address Card */}
                <PickupAddressCard />

                {/* Delivery Address Card */}
                <DeliveryAddressCard />
              </div>

              {/* Action Bar Container */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center justify-between shadow-sm">
                <button
                  type="button"
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  suppressHydrationWarning
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#E9C46A] hover:bg-[#C99A3D] text-[#3A2E12] text-sm font-bold px-7 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  suppressHydrationWarning
                >
                  Next Step
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              {/* Parcel Details Component */}
              <ParcelDetailsCard />

              {/* Action Bar Container */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center justify-between shadow-sm">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                  suppressHydrationWarning
                >
                  ← Back to Origin
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-[#E9C46A] hover:bg-[#C99A3D] text-[#3A2E12] text-sm font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  suppressHydrationWarning
                >
                  Next Step: Shipping Method →
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Column Area (Spans 1 column on lg screens) */}
        <div className="space-y-6">
          {/* Map Card */}
          <MapPanel />

          {/* Summary Card */}
          <ShipmentSummaryCard currentStep={currentStep} />
        </div>
      </div>
    </div>
  );
}