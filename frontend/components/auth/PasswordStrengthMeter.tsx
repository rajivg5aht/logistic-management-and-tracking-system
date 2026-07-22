const requirements = [
  {
    label: "At least 6 characters",
    test: (password: string) => password.length >= 6,
  },
  {
    label: "Upper and lowercase letters",
    test: (password: string) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    label: "At least one number",
    test: (password: string) => /\d/.test(password),
  },
  {
    label: "At least one symbol",
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const;

const strengthLevels = [
  { label: "Weak", color: "var(--danger)" },
  { label: "Fair", color: "var(--warning)" },
  { label: "Good", color: "var(--info)" },
  { label: "Strong", color: "var(--success)" },
] as const;

type PasswordStrengthMeterProps = {
  password: string;
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const requirementResults = requirements.map((requirement) => ({
    label: requirement.label,
    met: requirement.test(password),
  }));
  const metCount = requirementResults.filter((requirement) => requirement.met).length;
  const score =
    password.length === 0
      ? 0
      : requirementResults[0].met
        ? Math.max(1, metCount)
        : 1;
  const strength = strengthLevels[Math.max(0, score - 1)];
  const status = password.length === 0 ? "Start typing" : strength.label;

  return (
    <div className="space-y-2.5" id="password-strength">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold">
        <span className="text-[var(--text-soft)]">Password strength</span>
        <span
          aria-live="polite"
          className="text-[var(--text)]"
          id="password-strength-status"
        >
          {status}
        </span>
      </div>

      <div
        aria-label="Password strength"
        aria-valuemax={requirements.length}
        aria-valuemin={0}
        aria-valuenow={score}
        aria-valuetext={password.length === 0 ? "No password entered" : strength.label}
        className="flex gap-1.5"
        role="progressbar"
      >
        {strengthLevels.map((level, index) => (
          <span
            aria-hidden="true"
            className="h-1.5 flex-1 rounded-full transition-colors duration-200"
            key={level.label}
            style={{
              backgroundColor:
                index < score ? strength.color : "var(--surface-muted)",
            }}
          />
        ))}
      </div>

      <ul
        aria-label="Password recommendations"
        className="grid gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] sm:grid-cols-2"
        id="password-requirements"
      >
        {requirementResults.map((requirement) => (
          <li
            className={
              requirement.met
                ? "flex items-center gap-1.5 text-[var(--success)]"
                : "flex items-center gap-1.5"
            }
            key={requirement.label}
          >
            <span
              aria-hidden="true"
              className={
                requirement.met
                  ? "h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]"
                  : "h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--surface-muted)]"
              }
            />
            {requirement.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
