"use client";

interface ShipmentSummaryCardProps {
  currentStep?: number;
}

export function ShipmentSummaryCard({ currentStep = 1 }: ShipmentSummaryCardProps) {
  const step1Status = currentStep === 1 ? "In Progress" : "Completed";
  const step1Color = currentStep === 1 ? "text-[var(--accent-strong)] font-bold" : "text-[var(--success)] font-bold";
  const step1LabelColor = currentStep >= 1 ? "text-[var(--text-soft)]" : "text-[var(--text-muted)]";

  const step2Status = currentStep < 2 ? "Pending" : currentStep === 2 ? "In Progress" : "Completed";
  const step2Color = currentStep < 2 ? "text-[var(--text-muted)] font-bold" : currentStep === 2 ? "text-[var(--accent-strong)] font-bold" : "text-[var(--success)] font-bold";
  const step2LabelColor = currentStep >= 2 ? "text-[var(--text-soft)]" : "text-[var(--text-muted)]";

  const step3Status = currentStep < 3 ? "Pending" : currentStep === 3 ? "In Progress" : "Completed";
  const step3Color = currentStep < 3 ? "text-[var(--text-muted)] font-bold" : currentStep === 3 ? "text-[var(--accent-strong)] font-bold" : "text-[var(--success)] font-bold";
  const step3LabelColor = currentStep >= 3 ? "text-[var(--text-soft)]" : "text-[var(--text-muted)]";

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
      <h2 className="text-sm font-bold text-[var(--text)] mb-4 uppercase tracking-wider">
        Shipment Summary
      </h2>

      <div className="divide-y divide-[var(--border)] mb-5">
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

      <div className="flex gap-2.5 rounded-lg border border-[var(--warning-border)] bg-[var(--warning-soft)] p-3.5">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--accent-hover)] text-[11px] font-bold bg-white border border-[var(--warning-border)] select-none">
          i
        </div>
        <p className="text-[11px] font-medium text-[var(--text-soft)] leading-relaxed">
          Please ensure both addresses are accurate to avoid redirection fees or delivery delays.
        </p>
      </div>
    </div>
  );
}
