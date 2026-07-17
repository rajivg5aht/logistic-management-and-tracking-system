"use client";

import { useShipment, NEPAL_DISTRICTS } from "@/context/ShipmentContext";

export function DeliveryAddressCard() {
  const { deliveryAddress, updateDeliveryField } = useShipment();

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF6E4]">
          <svg
            className="h-4 w-4 text-[#D5A021]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11v11" />
            <path d="M14 9h7l3 3v4a2 2 0 0 1-2 2h-1" />
            <circle cx="7.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <h2 className="text-[17px] font-bold text-[#1E293B]">
          Delivery Address
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
            RECIPIENT NAME <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Jane Smith"
            value={deliveryAddress.recipientName}
            onChange={(e) => updateDeliveryField("recipientName", e.target.value)}
            className="w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--step-active)] focus:ring-1 focus:ring-[var(--step-active)] transition-all"
            suppressHydrationWarning
          />
        </div>

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
              value={deliveryAddress.phoneNumber}
              onChange={(e) => updateDeliveryField("phoneNumber", e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={10}
              className="w-full h-11 border border-[#E2E8F0] rounded-r-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--step-active)] focus:ring-1 focus:ring-[var(--step-active)] transition-all"
              suppressHydrationWarning
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
            DELIVERY ADDRESS <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Street name, Building No, Tole"
            value={deliveryAddress.streetAddress}
            onChange={(e) => updateDeliveryField("streetAddress", e.target.value)}
            className="w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--step-active)] focus:ring-1 focus:ring-[var(--step-active)] transition-all"
            suppressHydrationWarning
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1.5 uppercase">
              DISTRICT <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={deliveryAddress.district}
                onChange={(e) => updateDeliveryField("district", e.target.value)}
                className={`w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white focus:outline-none focus:border-[var(--step-active)] focus:ring-1 focus:ring-[var(--step-active)] transition-all appearance-none pr-10 ${
                  deliveryAddress.district ? "text-slate-800" : "text-slate-400"
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
              placeholder="e.g. Lalitpur"
              value={deliveryAddress.city}
              onChange={(e) => updateDeliveryField("city", e.target.value)}
              className="w-full h-11 border border-[#E2E8F0] rounded-lg px-3.5 text-[13px] bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--step-active)] focus:ring-1 focus:ring-[var(--step-active)] transition-all"
              suppressHydrationWarning
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-xs text-slate-500 font-medium cursor-pointer mt-4 select-none">
          <input
            type="checkbox"
            checked={deliveryAddress.residentialAddress}
            onChange={(e) => updateDeliveryField("residentialAddress", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[var(--step-active)] focus:ring-[var(--step-active)] accent-[var(--step-active)] cursor-pointer"
            suppressHydrationWarning
          />
          Residential address
        </label>
      </div>
    </div>
  );
}
