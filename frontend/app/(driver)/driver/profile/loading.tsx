export default function DriverProfileLoading() {
  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-3">
        <div className="h-5 w-20 animate-pulse rounded bg-[var(--border)]" />
        <div className="h-9 w-56 animate-pulse rounded bg-[var(--border)]" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[var(--border)]" />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="h-28 w-28 animate-pulse rounded-2xl bg-[var(--border)]" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-36 animate-pulse rounded bg-[var(--border)]" />
            <div className="h-8 w-64 max-w-full animate-pulse rounded bg-[var(--border)]" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[var(--border)]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {[0, 1].map((item) => (
            <div key={item} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <div className="h-5 w-44 animate-pulse rounded bg-[var(--border)]" />
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3].map((cell) => (
                  <div key={cell} className="h-24 animate-pulse rounded-xl bg-[var(--app-bg-soft)]" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-sm" />
      </div>
    </div>
  );
}
