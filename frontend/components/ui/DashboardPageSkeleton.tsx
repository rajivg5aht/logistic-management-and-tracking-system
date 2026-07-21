export default function DashboardPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading page">
      <span className="sr-only">Loading page...</span>
      <div className="h-8 w-64 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
    </div>
  );
}
