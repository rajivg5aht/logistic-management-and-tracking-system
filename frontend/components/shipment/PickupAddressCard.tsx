"use client";

import { useShipment, NEPAL_DISTRICTS } from "@/context/ShipmentContext";

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

        {/* Phone Number */}
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
            PHONE NUMBER <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <span className="flex h-11 items-center rounded-l-lg border border-r-0 border-[#E2E8F0] bg-slate-50 px-3 text-[13px] font-semibold text-slate-500">
              +977
            </span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="98XXXXXXXX"
              value={pickupAddress.phoneNumber}
              onChange={(e) => updatePickupField("phoneNumber", e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={10}
              className="w-full h-11 border border-[#E2E8F0] rounded-r-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all"
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
            PICKUP ADDRESS <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Street name, Building No, Tole"
            value={pickupAddress.streetAddress}
            onChange={(e) => updatePickupField("streetAddress", e.target.value)}
            className="w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all"
            suppressHydrationWarning
          />
        </div>

        {/* District and City / Municipality */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
              DISTRICT <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={pickupAddress.district}
                onChange={(e) => updatePickupField("district", e.target.value)}
                className={`w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all appearance-none pr-10 ${
                  pickupAddress.district ? "text-slate-800" : "text-slate-400"
                }`}
                suppressHydrationWarning
              >
                <option value="">Select District</option>
                {NEPAL_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
              CITY / MUNICIPALITY <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kathmandu"
              value={pickupAddress.city}
              onChange={(e) => updatePickupField("city", e.target.value)}
              className="w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF] transition-all"
              suppressHydrationWarning
            />
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