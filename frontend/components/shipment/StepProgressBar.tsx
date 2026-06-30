"use client";

interface Step {
  number: number;
  label: string;
  active?: boolean;
}

interface StepProgressBarProps {
  steps: Step[];
}

export function StepProgressBar({ steps }: StepProgressBarProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto px-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex flex-col items-center flex-1">
          {/* Top row containing left line, circle, and right line */}
          <div className="flex items-center w-full">
            {/* Left connector line */}
            <div
              className={`flex-1 h-[1.5px] bg-[#E2E8F0] ${
                index === 0 ? "invisible" : ""
              }`}
            />

            {/* Step Circle */}
            <div
              className={`flex w-9 h-9 items-center justify-center rounded-full text-sm font-bold z-10 shrink-0 transition-all ${
                step.active
                  ? "bg-[#3A236E] text-white"
                  : "border-[#E2E8F0] border-2 bg-white text-[#94A3B8]"
              }`}
            >
              {step.number}
            </div>

            {/* Right connector line */}
            <div
              className={`flex-1 h-[1.5px] bg-[#E2E8F0] ${
                index === steps.length - 1 ? "invisible" : ""
              }`}
            />
          </div>

          {/* Label below the circle */}
          <span
            className={`mt-2 text-xs font-semibold whitespace-nowrap text-center ${
              step.active ? "text-[#1E293B] font-bold" : "text-[#94A3B8]"
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}