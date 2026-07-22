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
          <div className="flex items-center w-full">
            <div
              className={`flex-1 h-[1.5px] bg-[var(--border)] ${
                index === 0 ? "invisible" : ""
              }`}
            />

            <div
              className={`flex w-9 h-9 items-center justify-center rounded-full text-sm font-bold z-10 shrink-0 transition-all ${
                step.active
                  ? "bg-[var(--accent)] text-[var(--text-on-accent)]"
                  : "border-[var(--border)] border-2 bg-white text-[var(--text-muted)]"
              }`}
            >
              {step.number}
            </div>

            <div
              className={`flex-1 h-[1.5px] bg-[var(--border)] ${
                index === steps.length - 1 ? "invisible" : ""
              }`}
            />
          </div>

          <span
            className={`mt-2 text-xs font-semibold whitespace-nowrap text-center ${
              step.active ? "text-[var(--text)] font-bold" : "text-[var(--text-muted)]"
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
