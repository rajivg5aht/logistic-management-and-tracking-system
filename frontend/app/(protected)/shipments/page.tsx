"use client";

import { useState } from "react";
import { StepProgressBar } from "@/components/shipment/StepProgressBar";
import { PickupAddressCard } from "@/components/shipment/PickupAddressCard";
import { DeliveryAddressCard } from "@/components/shipment/DeliveryAddressCard";
import { ParcelDetailsCard } from "@/components/shipment/ParcelDetailsCard";
import { SelectServiceCard } from "@/components/shipment/SelectServiceCard";
import { DetailedSummaryCard } from "@/components/shipment/DetailedSummaryCard";
import { MapPanel } from "@/components/shipment/MapPanel";
import { ShipmentSummaryCard } from "@/components/shipment/ShipmentSummaryCard";
import { ShipmentProvider, useShipment } from "@/context/ShipmentContext";
import { ReviewAndPayCard } from "@/components/shipment/ReviewAndPayCard";

function ShipmentPageContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { pickupAddress, deliveryAddress, packageDetails } = useShipment();

  const steps = [
    { number: 1, label: "Addresses", active: currentStep === 1 },
    { number: 2, label: "Package Details", active: currentStep === 2 },
    { number: 3, label: "Service Type", active: currentStep === 3 },
    { number: 4, label: "Review & Pay", active: currentStep === 4 },
  ];

  const validateStep1 = (): boolean => {
    const errors: string[] = [];

    // Pickup address validation
    if (!pickupAddress.fullName.trim()) errors.push("Pickup: Full Name is required");
    if (!pickupAddress.streetAddress.trim()) errors.push("Pickup: Street Address is required");
    if (!pickupAddress.city.trim()) errors.push("Pickup: City is required");
    if (!pickupAddress.postalCode.trim()) errors.push("Pickup: Postal Code is required");

    // Delivery address validation
    if (!deliveryAddress.recipientName.trim()) errors.push("Delivery: Recipient Name is required");
    if (!deliveryAddress.streetAddress.trim()) errors.push("Delivery: Street Address is required");
    if (!deliveryAddress.city.trim()) errors.push("Delivery: City is required");
    if (!deliveryAddress.postalCode.trim()) errors.push("Delivery: Postal Code is required");

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: string[] = [];

    const weightNum = parseFloat(packageDetails.weight);
    if (!packageDetails.weight.trim() || isNaN(weightNum) || weightNum <= 0) {
      errors.push("Package: Weight must be greater than 0");
    }
    if (!packageDetails.dimensions.length.trim()) errors.push("Package: Length is required");
    if (!packageDetails.dimensions.width.trim()) errors.push("Package: Width is required");
    if (!packageDetails.dimensions.height.trim()) errors.push("Package: Height is required");

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const clearErrors = () => {
    setValidationErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Step Progress Bar */}
      <div className="py-2">
        <StepProgressBar steps={steps} />
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 mt-0.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-red-800 mb-1.5">Please fix the following errors:</p>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-[12px] text-red-700 font-medium flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
              suppressHydrationWarning
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
                  onClick={handleNextFromStep1}
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
                  onClick={() => { clearErrors(); setCurrentStep(1); }}
                  className="flex items-center gap-2 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                  suppressHydrationWarning
                >
                  ← Back to Origin
                </button>

                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="bg-[#E9C46A] hover:bg-[#C99A3D] text-[#3A2E12] text-sm font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  suppressHydrationWarning
                >
                  Next Step: Service Type
                </button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              {/* Select Service Component */}
              <SelectServiceCard />

              {/* Action Bar Container */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center justify-between shadow-sm">
                <button
                  type="button"
                  onClick={() => { clearErrors(); setCurrentStep(2); }}
                  className="flex items-center gap-2 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                  suppressHydrationWarning
                >
                  ← Back to Package
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="bg-[#E9C46A] hover:bg-[#C99A3D] text-[#3A2E12] text-sm font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  suppressHydrationWarning
                >
                  Next Step: Review & Pay →
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Column Area (Spans 1 column on lg screens) */}
        {currentStep !== 4 && (
          <div className="space-y-6">
            {currentStep === 3 ? (
              <DetailedSummaryCard />
            ) : (
              <>
                {/* Map Card */}
                <MapPanel />

                {/* Summary Card */}
                <ShipmentSummaryCard currentStep={currentStep} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Step 4: Review & Pay — Full-width (has its own internal grid) */}
      {currentStep === 4 && (
        <div className="space-y-5">
          <ReviewAndPayCard onEditStep={(step) => setCurrentStep(step)} />

          {/* Back button */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
              suppressHydrationWarning
            >
              ← Back to Service Type
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateShipmentPage() {
  return (
    <ShipmentProvider>
      <ShipmentPageContent />
    </ShipmentProvider>
  );
}