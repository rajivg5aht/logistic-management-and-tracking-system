"use client";

interface ShipmentSummaryCardProps {
  currentStep?: number;
}

export function ShipmentSummaryCard({ currentStep = 1 }: ShipmentSummaryCardProps) {
  const step1Status = currentStep === 1 ? "In Progress" : "Completed";
  const step1Color = currentStep === 1 ? "text-[var(--step-active)] font-bold" : "text-[#5f7f35] font-bold";
  const step1LabelColor = currentStep >= 1 ? "text-slate-600" : "text-slate-400";

  const step2Status = currentStep < 2 ? "Pending" : currentStep === 2 ? "In Progress" : "Completed";
  const step2Color = currentStep < 2 ? "text-slate-400 font-bold" : currentStep === 2 ? "text-[var(--step-active)] font-bold" : "text-[#5f7f35] font-bold";
  const step2LabelColor = currentStep >= 2 ? "text-slate-600" : "text-slate-400";

  const step3Status = currentStep < 3 ? "Pending" : currentStep === 3 ? "In Progress" : "Completed";
  const step3Color = currentStep < 3 ? "text-slate-400 font-bold" : currentStep === 3 ? "text-[var(--step-active)] font-bold" : "text-[#5f7f35] font-bold";
  const step3LabelColor = currentStep >= 3 ? "text-slate-600" : "text-slate-400";

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
        Shipment Summary
      </h2>

      <div className="divide-y divide-[#E2E8F0] mb-5">
        <div className="flex items-center justify-between py-3">
          <span className={`text-[13px] font-semibold ${step1LabelColor}`}>Step 1: Addresses</span>
          <span className={`text-[13px] ${step1Color}`}>{step1Status}</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className={`text-[13px] font-semibold ${step2LabelColor}`}>Step 2: Package</span>
          <span className={`text-[13px] ${step2Color}`}>{step2Status}</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className={`text-[13px] font-semibold ${step3LabelColor}`}>Step 3: Service</span>
          <span className={`text-[13px] ${step3Color}`}>{step3Status}</span>
        </div>
      </div>

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
