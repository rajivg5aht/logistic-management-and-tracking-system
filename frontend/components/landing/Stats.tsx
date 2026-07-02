const stats = [
  { value: "77", label: "Districts Covered" },
  { value: "1.2M+", label: "Parcels Delivered" },
  { value: "500+", label: "Partner Businesses" },
  { value: "99.8%", label: "On-time Delivery Rate" },
];

export default function Stats() {
  return (
    <section id="stats" className="relative pt-4 pb-16 sm:pb-20 lg:pt-6 lg:pb-24">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="dark-panel relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(200,162,74,0.25)] to-transparent" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,162,74,0.06)_0%,transparent_70%)]" />

          <div className="relative grid grid-cols-2 gap-y-10 gap-x-4 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center ${
                  idx !== 0 ? "lg:border-l lg:border-[rgba(255,255,255,0.08)]" : ""
                }`}
              >
                <span className="text-3xl font-extrabold tracking-tight text-[var(--accent)] sm:text-4xl lg:text-5xl">
                  {stat.value}
                </span>
                <span className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-on-dark-muted)] sm:text-xs">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
