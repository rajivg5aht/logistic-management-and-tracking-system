"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";

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
      <div className="pointer-events-none absolute left-1/2 -top-64 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,162,74,0.05)_0%,transparent_70%)] blur-[130px]" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="section-tag"><span className="section-tag-dot" />Simple &amp; Fast · Trusted Network</div>

          <h1 className="heading-xl">
            Logistics Reimagined for
            <br />
            <span className="text-gradient">Modern Nepal.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[520px] body-text">
            Seamless end-to-end delivery solutions tailored for the Himalayan terrain. Whether it&apos;s the
            heart of Kathmandu or a remote mountain trail, we bridge the gap.
          </p>

          <form
            onSubmit={handleTrack}
            className="mx-auto mt-9 flex w-full max-w-[520px] flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center"
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

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
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
      </div>
    </section>
  );
}
