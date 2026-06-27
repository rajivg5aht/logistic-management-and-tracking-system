"use client";

import { useShipment } from "@/context/ShipmentContext";

export function PickupAddressCard() {
  const { pickupAddress, updatePickupField } = useShipment();

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF1FF]">
          <svg
            className="h-4 w-4 text-[#6C63FF]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <h2 className="text-[17px] font-bold text-[#1E293B]">
          Pickup Address
        </h2>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name / Company */}
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
            FULL NAME / COMPANY <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            value={pickupAddress.fullName}
            onChange={(e) => updatePickupField("fullName", e.target.value)}
            className={`w-full h-11 border rounded-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all ${
              !pickupAddress.fullName.trim() ? "border-[#E2E8F0]" : "border-[#E2E8F0]"
            }`}
            suppressHydrationWarning
          />
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
            STREET ADDRESS <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="123 Logistics Way"
            value={pickupAddress.streetAddress}
            onChange={(e) => updatePickupField("streetAddress", e.target.value)}
            className="w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all"
            suppressHydrationWarning
          />
        </div>

        {/* City and Postal Code */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
              CITY <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="New York"
              value={pickupAddress.city}
              onChange={(e) => updatePickupField("city", e.target.value)}
              className="w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
              POSTAL CODE <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="10001"
              value={pickupAddress.postalCode}
              onChange={(e) => updatePickupField("postalCode", e.target.value)}
              className="w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all"
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
            COUNTRY
          </label>
          <div className="relative">
            <select
              value={pickupAddress.country}
              onChange={(e) => updatePickupField("country", e.target.value)}
              className="w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white text-slate-800 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all appearance-none pr-10"
              suppressHydrationWarning
            >
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Germany</option>
              <option>France</option>
              <option>Australia</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-center gap-2.5 text-xs text-slate-500 font-medium cursor-pointer mt-4 select-none">
          <input
            type="checkbox"
            checked={pickupAddress.saveToAddressBook}
            onChange={(e) => updatePickupField("saveToAddressBook", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#6C63FF] focus:ring-[#6C63FF] accent-[#6C63FF] cursor-pointer"
            suppressHydrationWarning
          />
          Save to address book
        </label>
      </div>
    </div>
  );
}