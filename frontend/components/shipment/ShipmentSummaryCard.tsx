"use client";

export function ShipmentSummaryCard() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
      {/* Heading */}
      <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
        Shipment Summary
      </h2>

      {/* Step Status Rows */}
      <div className="divide-y divide-[#E2E8F0] mb-5">
        {/* Step 1 */}
        <div className="flex items-center justify-between py-3">
          <span className="text-[13px] font-semibold text-slate-600">Step 1: Addresses</span>
          <span className="text-[13px] font-bold text-[#6C63FF]">In Progress</span>
        </div>

        {/* Step 2 */}
        <div className="flex items-center justify-between py-3">
          <span className="text-[13px] font-semibold text-slate-400">Step 2: Package</span>
          <span className="text-[13px] font-bold text-slate-400">Pending</span>
        </div>

        {/* Step 3 */}
        <div className="flex items-center justify-between py-3">
          <span className="text-[13px] font-semibold text-slate-400">Step 3: Service</span>
          <span className="text-[13px] font-bold text-slate-400">Pending</span>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="flex gap-2.5 rounded-lg border border-[#FDE8C3] bg-[#FEF6E4] p-3.5">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#D5A021] text-[11px] font-bold bg-white border border-[#FDE8C3] select-none">
          i
        </div>
        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
          Please ensure both addresses are accurate to avoid redirection fees or delivery delays.
        </p>
      </div>
    </div>
  );
}