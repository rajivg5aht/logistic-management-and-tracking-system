import Link from "next/link";
import { Navigation, Activity, MapPin } from "lucide-react";

const activeRoutes = [
  { from: "Kathmandu", to: "Pokhara", status: "Active Now" },
  { from: "Biratnagar", to: "Itahari", status: "Active Now" },
  { from: "Butwal", to: "Bhairahawa", status: "En Route" },
];

function CoverageMap() {
  return (
    <svg viewBox="0 0 480 300" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="netGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="netRoute" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <filter id="netBlur">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {Array.from({ length: 16 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 20} x2="480" y2={i * 20} stroke="rgba(200,162,74,0.05)" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="300" stroke="rgba(200,162,74,0.05)" strokeWidth="0.5" />
      ))}

      <path
        d="M20 210 L90 150 L140 185 L200 120 L260 170 L320 110 L380 165 L440 130 L460 175 L460 260 L20 260 Z"
        fill="rgba(200,162,74,0.04)"
        stroke="rgba(200,162,74,0.14)"
        strokeWidth="1"
      />

      {[
        { x1: 120, y1: 190, x2: 240, y2: 110 },
        { x1: 240, y1: 110, x2: 360, y2: 200 },
        { x1: 120, y1: 190, x2: 200, y2: 240 },
        { x1: 240, y1: 110, x2: 400, y2: 90 },
        { x1: 200, y1: 240, x2: 360, y2: 200 },
      ].map((r, i) => (
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="url(#netRoute)" strokeWidth="1.4" filter="url(#netBlur)">
          <animate attributeName="opacity" values="0.35;0.8;0.35" dur={`${3 + i * 0.4}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </line>
      ))}

      {[
        { cx: 120, cy: 190 },
        { cx: 240, cy: 110 },
        { cx: 360, cy: 200 },
        { cx: 200, cy: 240 },
        { cx: 400, cy: 90 },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r="12" fill="url(#netGlow)" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={n.cx} cy={n.cy} r="3.5" fill="var(--accent)" filter="url(#netBlur)" />
          <circle cx={n.cx} cy={n.cy} r="1.4" fill="var(--text-on-dark)" opacity="0.95" />
        </g>
      ))}
    </svg>
  );
}

export default function Network() {
  return (
    <section id="network" className="relative overflow-hidden bg-[var(--surface-dark)] py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,162,74,0.06)_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(200,162,74,0.2)] to-transparent" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[42fr_58fr] lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="section-tag border-[rgba(200,162,74,0.28)] bg-[rgba(200,162,74,0.10)] text-[var(--accent)]">
              <span className="section-tag-dot" />Nationwide Coverage
            </div>
            <h2 className="mt-1 text-3xl font-extrabold leading-[1.1] tracking-tight text-[var(--text-on-dark)] sm:text-4xl lg:text-5xl">
              An Unrivaled<br />
              <span className="text-[var(--accent)]">Delivery Network</span>
            </h2>
            <p className="mx-auto mt-5 max-w-[460px] text-[0.98rem] leading-7 text-[var(--text-on-dark-muted)] lg:mx-0">
              Our proprietary logistics engine analyzes terrain and weather in real time, dynamically
              adjusting routes to conquer the most challenging geographical conditions of Nepal.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link href="/register" className="btn-primary">
                <Navigation size={16} />View Coverage Map
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[rgba(200,162,74,0.10)] via-transparent to-[rgba(200,162,74,0.05)] blur-2xl" />
            <div className="relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[var(--surface-dark-2)] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0f0e0d]">
                <CoverageMap />

                <div className="absolute right-3 top-3 flex items-center gap-2 rounded-lg border border-[rgba(200,162,74,0.18)] bg-[rgba(25,24,23,0.82)] px-3 py-2 backdrop-blur-md">
                  <Activity size={14} className="text-[var(--accent)]" />
                  <div className="leading-tight">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-on-dark-muted)]">Fleet Load</p>
                    <p className="text-sm font-bold text-[var(--text-on-dark)]">86%</p>
                  </div>
                </div>

                <div className="absolute inset-x-3 bottom-3 space-y-2">
                  {activeRoutes.map((route) => (
                    <div
                      key={`${route.from}-${route.to}`}
                      className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(25,24,23,0.78)] px-3 py-2 backdrop-blur-md"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold text-[var(--text-on-dark)]">
                        <MapPin size={13} className="text-[var(--accent)]" />
                        {route.from} <span className="text-[var(--text-on-dark-muted)]">→</span> {route.to}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          route.status === "Active Now"
                            ? "bg-[rgba(95,127,53,0.18)] text-[var(--accent)]"
                            : "bg-[var(--accent-soft)] text-[var(--accent)]"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${route.status === "Active Now" ? "bg-[var(--accent)]" : "bg-[var(--accent)]"}`} />
                        {route.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
