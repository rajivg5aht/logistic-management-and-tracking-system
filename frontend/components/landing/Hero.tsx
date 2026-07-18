"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Truck, MapPin } from "lucide-react";

function TerrainVisualization() {
  return (
    <svg viewBox="0 0 600 380" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="heroSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#211f1c" />
          <stop offset="100%" stopColor="#0f0e0d" />
        </linearGradient>
        <radialGradient id="heroSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="heroSnow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,247,232,0.85)" />
          <stop offset="100%" stopColor="rgba(200,162,74,0.15)" />
        </linearGradient>
        <filter id="heroBlur">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="600" height="380" fill="url(#heroSky)" />

      <circle cx="450" cy="105" r="90" fill="url(#heroSun)" opacity="0.55" />
      <circle cx="450" cy="105" r="26" fill="var(--accent)" opacity="0.9" filter="url(#heroBlur)" />

      {[
        [70, 60], [130, 40], [200, 70], [280, 50], [90, 110], [340, 90], [520, 60], [560, 120],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.4" fill="rgba(255,247,232,0.55)">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}

      <path d="M0 250 L110 150 L190 215 L280 130 L360 205 L460 120 L560 200 L600 165 L600 380 L0 380 Z" fill="#2a2723" />
      <path d="M280 130 L305 155 L255 155 Z M460 120 L488 150 L432 150 Z" fill="rgba(255,247,232,0.28)" />

      <path d="M0 300 L90 215 L170 275 L250 195 L340 280 L430 205 L520 285 L600 235 L600 380 L0 380 Z" fill="#1a1816" />
      <path d="M250 195 L278 228 L222 228 Z M430 205 L456 236 L404 236 Z" fill="url(#heroSnow)" />

      <path
        d="M70 330 Q210 300 300 250 T520 230"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="4 6"
        opacity="0.85"
        filter="url(#heroBlur)"
      >
        <animate attributeName="stroke-dashoffset" values="0;-40" dur="1.6s" repeatCount="indefinite" />
      </path>

      <g transform="translate(70,330)">
        <circle r="12" fill="url(#heroSun)" opacity="0.7" />
        <circle r="4" fill="var(--accent)" filter="url(#heroBlur)" />
      </g>
      <circle r="5" fill="var(--text-on-dark)" filter="url(#heroBlur)">
        <animateMotion dur="4.5s" repeatCount="indefinite" path="M70 330 Q210 300 300 250 T520 230" />
      </circle>
      <g transform="translate(520,230)">
        <circle r="14" fill="url(#heroSun)" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.75;0.3" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle r="4.5" fill="var(--accent)" filter="url(#heroBlur)" />
        <circle r="1.6" fill="var(--text-on-dark)" />
      </g>
    </svg>
  );
}

export default function Hero() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = trackingId.trim().toUpperCase();
    router.push(
      normalized
        ? `/tracking?trackingId=${encodeURIComponent(normalized)}`
        : "/tracking",
    );
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-[var(--app-bg)] pb-16 pt-28 sm:pb-20 lg:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,162,74,0.05)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute -right-48 -top-64 h-[720px] w-[720px] rounded-full bg-[radial-gradient(circle,rgba(200,162,74,0.05)_0%,transparent_70%)] blur-[130px]" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[48fr_52fr] lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="section-tag"><span className="section-tag-dot" />Simple &amp; Fast · Trusted Network</div>

            <h1 className="heading-xl">
              Logistics Reimagined for
              <br />
              <span className="text-gradient">Modern Nepal.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-[520px] body-text lg:mx-0">
              Seamless end-to-end delivery solutions tailored for the Himalayan terrain. Whether it&apos;s the
              heart of Kathmandu or a remote mountain trail, we bridge the gap.
            </p>

            <form
              onSubmit={handleTrack}
              className="mx-auto mt-9 flex w-full max-w-[520px] flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center lg:mx-0"
            >
              <div className="flex flex-1 items-center gap-2.5 px-3">
                <MapPin size={18} className="shrink-0 text-[var(--accent)]" />
                <input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter tracking ID (e.g. LN-482913)"
                  className="h-11 w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
                  aria-label="Tracking ID"
                  suppressHydrationWarning
                />
              </div>
              <button type="submit" className="btn-primary sm:w-auto" suppressHydrationWarning>
                Track Now <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:items-center lg:justify-start">
              <div className="flex -space-x-2.5">
                {["#C99A3D", "#E9C46A", "#3A2E12", "#1D7A8C"].map((c) => (
                  <span
                    key={c}
                    className="h-8 w-8 rounded-full border-2 border-[var(--app-bg)]"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Trusted by <span className="font-bold text-[var(--text)]">60,000+</span> daily active users across Nepal
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[rgba(200,162,74,0.10)] via-transparent to-[rgba(169,121,29,0.05)] opacity-70 blur-2xl" />
            <div className="dark-panel group relative overflow-hidden p-3">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(200,162,74,0.25)] to-transparent" />

              <div className="relative aspect-[16/11] overflow-hidden rounded-xl">
                <TerrainVisualization />

                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-[rgba(200,162,74,0.20)] bg-[rgba(25,24,23,0.82)] px-3 py-1.5 backdrop-blur-md">
                  <Truck size={14} className="text-[var(--accent)]" />
                  <span className="text-xs font-bold text-[var(--text-on-dark)]">2.4d ETA</span>
                </div>

                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-xl border border-[rgba(200,162,74,0.15)] bg-[rgba(25,24,23,0.86)] p-3.5 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-lg">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(200,162,74,0.20)] bg-[var(--accent-soft)] text-[var(--accent)]">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-on-dark-muted)]">Live Shipment</p>
                      <p className="truncate text-sm font-bold text-[var(--text-on-dark)]">Kathmandu Hub</p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[rgba(95,127,53,0.18)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#9dbb6f]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9dbb6f]" />
                    On Schedule
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
