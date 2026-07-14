"use client";

import { RotateCcw } from "lucide-react";

export default function AdminProfileError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[rgba(181,71,59,0.28)] bg-[rgba(181,71,59,0.06)] p-6 text-center shadow-sm">
      <h1 className="text-xl font-black text-[var(--danger)]">Admin profile could not load</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-[var(--text-soft)]">
        {error.message || "Refresh the profile data and try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-secondary btn-sm mt-5"
      >
        <RotateCcw size={15} />
        Retry
      </button>
    </div>
  );
}
