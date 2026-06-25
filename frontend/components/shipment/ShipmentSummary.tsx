"use client";

export function ShipmentSummary() {
  return (
    <div className="app-card p-6">
      <h2 className="text-lg font-semibold text-[#1A2B3C] mb-5">Summary</h2>

      {/* Route Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8A9BAD] mb-1">
            Origin
          </p>
          <p className="text-sm font-bold text-[#1A2B3C]">London, UK</p>
        </div>

        <div className="flex-1 px-3">
          <div className="h-px bg-[#DDD8CE] relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
              <svg
                className="w-4 h-4 text-[#8A9BAD]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8A9BAD] mb-1">
            Destination
          </p>
          <p className="text-sm font-bold text-[#1A2B3C]">Berlin, GER</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#8A9BAD]">Base Rate</span>
          <span className="text-sm font-semibold text-[#1A2B3C]">€42.00</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#E8A84B]">Express Service</span>
          <span className="text-sm font-semibold text-[#1A2B3C]">€18.50</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#8A9BAD]">Fuel Surcharge</span>
          <span className="text-sm font-semibold text-[#1A2B3C]">€4.25</span>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-[#DDD8CE] mb-4" />

      {/* Total */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold text-[#1A2B3C]">Total</span>
        <span className="text-3xl font-bold text-[#2B7A7A]">€64.75</span>
      </div>

      {/* CTA Button */}
      <button
        type="button"
        className="w-full h-14 rounded-xl bg-[#E8B84B] text-[#1A2B3C] font-bold text-base hover:bg-[#E8B84B]/90 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        Confirm & Pay →
      </button>
    </div>
  );
}