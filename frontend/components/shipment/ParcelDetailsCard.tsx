"use client";

import { useShipment } from "@/context/ShipmentContext";
import { Package, GlassWater, ClipboardCheck, Check } from "lucide-react";

export function ParcelDetailsCard() {
  const { packageDetails, updatePackageField, updateDimension } = useShipment();

  const incrementQuantity = () => updatePackageField("quantity", packageDetails.quantity + 1);
  const decrementQuantity = () => updatePackageField("quantity", packageDetails.quantity > 1 ? packageDetails.quantity - 1 : 1);

  return (
    <div className="space-y-6">
      {/* Select Parcel Type Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
          Select Parcel Type
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Standard Box */}
          <div
            onClick={() => updatePackageField("parcelType", "standard")}
            className={`relative border rounded-xl p-5 cursor-pointer transition-all duration-200 flex flex-col items-start select-none ${
              packageDetails.parcelType === "standard"
                ? "border-[#1D7A8C] bg-[#EAF5F8]/30"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            {/* Top Row: Icon and Checkmark */}
            <div className="flex items-center justify-between w-full">
              <div
                className={`p-2.5 rounded-lg ${
                  packageDetails.parcelType === "standard"
                    ? "bg-[#EAF5F8] text-[#1D7A8C]"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                <Package className="h-5 w-5" />
              </div>

              {packageDetails.parcelType === "standard" ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1D7A8C]">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-300 bg-white" />
              )}
            </div>

            {/* Label & Description */}
            <span className="text-[14px] font-bold text-slate-800 mt-4">Standard Box</span>
            <span className="text-[11px] text-slate-500 leading-relaxed mt-1.5">
              Rigid containers for everyday items and stackable goods.
            </span>
          </div>

          {/* Option 2: Fragile / High Value */}
          <div
            onClick={() => updatePackageField("parcelType", "fragile")}
            className={`relative border rounded-xl p-5 cursor-pointer transition-all duration-200 flex flex-col items-start select-none ${
              packageDetails.parcelType === "fragile"
                ? "border-[#1D7A8C] bg-[#EAF5F8]/30"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            {/* Top Row: Icon and Checkmark */}
            <div className="flex items-center justify-between w-full">
              <div
                className={`p-2.5 rounded-lg ${
                  packageDetails.parcelType === "fragile"
                    ? "bg-[#EAF5F8] text-[#1D7A8C]"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                <GlassWater className="h-5 w-5" />
              </div>

              {packageDetails.parcelType === "fragile" ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1D7A8C]">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-300 bg-white" />
              )}
            </div>

            {/* Label & Description */}
            <span className="text-[14px] font-bold text-slate-800 mt-4">Fragile / High Value</span>
            <span className="text-[11px] text-slate-500 leading-relaxed mt-1.5">
              Special handling for electronics, glass, or delicate equipment.
            </span>
          </div>

          {/* Option 3: Pallet / Bulk */}
          <div
            onClick={() => updatePackageField("parcelType", "pallet")}
            className={`relative border rounded-xl p-5 cursor-pointer transition-all duration-200 flex flex-col items-start select-none ${
              packageDetails.parcelType === "pallet"
                ? "border-[#1D7A8C] bg-[#EAF5F8]/30"
                : "border-[#E2E8F0] bg-white hover:border-slate-300"
            }`}
          >
            {/* Top Row: Icon and Checkmark */}
            <div className="flex items-center justify-between w-full">
              <div
                className={`p-2.5 rounded-lg ${
                  packageDetails.parcelType === "pallet"
                    ? "bg-[#EAF5F8] text-[#1D7A8C]"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                <ClipboardCheck className="h-5 w-5" />
              </div>

              {packageDetails.parcelType === "pallet" ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1D7A8C]">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-300 bg-white" />
              )}
            </div>

            {/* Label & Description */}
            <span className="text-[14px] font-bold text-slate-800 mt-4">Pallet / Bulk</span>
            <span className="text-[11px] text-slate-500 leading-relaxed mt-1.5">
              Oversized shipments requiring forklift or heavy lifting.
            </span>
          </div>
        </div>
      </div>

      {/* Package Specifications Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-5 uppercase tracking-wider">
          Package Specifications
        </h2>

        {/* Row 1: Weight and Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Total Weight */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
              Total Weight <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-[#E2E8F0] rounded-lg bg-white h-11 focus-within:border-[#6C63FF] focus-within:ring-1 focus-within:ring-[#6C63FF] transition-all overflow-hidden">
              <input
                type="text"
                placeholder="0.00"
                value={packageDetails.weight}
                onChange={(e) => updatePackageField("weight", e.target.value)}
                className="w-full bg-transparent focus:outline-none text-[13px] text-slate-800 placeholder-slate-400 px-3.5"
                suppressHydrationWarning
              />
              <span className="bg-[#EFEAE0] text-slate-600 font-bold text-[10px] px-3.5 flex items-center shrink-0 border-l border-[#E2E8F0] h-full select-none">
                KG
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
              Quantity
            </label>
            <div className="flex items-center justify-between border border-[#E2E8F0] rounded-lg bg-white h-11 px-1.5 select-none">
              <button
                type="button"
                onClick={decrementQuantity}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer font-bold transition-colors"
                suppressHydrationWarning
              >
                -
              </button>
              <span className="text-[13px] font-bold text-slate-800">
                {packageDetails.quantity}
              </span>
              <button
                type="button"
                onClick={incrementQuantity}
                className="bg-[#E5F1F3] hover:bg-[#d8e8eb] text-[#1D7A8C] rounded-md w-7 h-7 flex items-center justify-center cursor-pointer font-bold transition-colors"
                suppressHydrationWarning
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Dimensions */}
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-2.5 uppercase">
            Dimensions (Outer Box) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Length */}
            <div className="relative flex items-center border border-[#E2E8F0] rounded-lg bg-white h-11 px-3.5 focus-within:border-[#6C63FF] focus-within:ring-1 focus-within:ring-[#6C63FF] transition-all">
              <input
                type="text"
                placeholder="Length"
                value={packageDetails.dimensions.length}
                onChange={(e) => updateDimension("length", e.target.value)}
                className="w-full bg-transparent focus:outline-none text-[13px] text-slate-800 placeholder-slate-400"
                suppressHydrationWarning
              />
              <span className="text-slate-400 text-[10px] font-bold shrink-0 ml-2 select-none">CM</span>
            </div>

            {/* Width */}
            <div className="relative flex items-center border border-[#E2E8F0] rounded-lg bg-white h-11 px-3.5 focus-within:border-[#6C63FF] focus-within:ring-1 focus-within:ring-[#6C63FF] transition-all">
              <input
                type="text"
                placeholder="Width"
                value={packageDetails.dimensions.width}
                onChange={(e) => updateDimension("width", e.target.value)}
                className="w-full bg-transparent focus:outline-none text-[13px] text-slate-800 placeholder-slate-400"
                suppressHydrationWarning
              />
              <span className="text-slate-400 text-[10px] font-bold shrink-0 ml-2 select-none">CM</span>
            </div>

            {/* Height */}
            <div className="relative flex items-center border border-[#E2E8F0] rounded-lg bg-white h-11 px-3.5 focus-within:border-[#6C63FF] focus-within:ring-1 focus-within:ring-[#6C63FF] transition-all">
              <input
                type="text"
                placeholder="Height"
                value={packageDetails.dimensions.height}
                onChange={(e) => updateDimension("height", e.target.value)}
                className="w-full bg-transparent focus:outline-none text-[13px] text-slate-800 placeholder-slate-400"
                suppressHydrationWarning
              />
              <span className="text-slate-400 text-[10px] font-bold shrink-0 ml-2 select-none">CM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}