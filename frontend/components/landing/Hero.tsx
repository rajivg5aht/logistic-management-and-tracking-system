"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = trackingId.trim().toUpperCase();
    // No code entered: send visitors to login. With a code: open the public
    // track-by-code page (no login required).
    router.push(
      normalized
        ? `/track?trackingId=${encodeURIComponent(normalized)}`
        : "/login",
    );
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-[#0f0e0d]">
      {/* Full-bleed sunset photo */}
      <img
        src="/himal.jpg"
        alt="Freight truck on a Himalayan highway at dusk, snow-capped peaks in the distance"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />

      {/* Dark left-to-right scrim: darkens the left for text, lets the sunset + peaks show on the right */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(12,11,10,0.88)_0%,rgba(12,11,10,0.72)_38%,rgba(12,11,10,0.35)_62%,rgba(12,11,10,0.05)_100%)]" />
      {/* One continuous fade prevents a light seam where the hero meets the next section. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(12,11,10,0.35)_0%,transparent_28%,transparent_58%,rgba(248,245,239,0.08)_70%,rgba(248,245,239,0.42)_84%,var(--app-bg)_100%)]"
      />

      {/* Content */}
      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="flex min-h-[600px] flex-col justify-center pb-16 pt-28 sm:min-h-[640px] sm:pb-20 lg:min-h-[720px] lg:pt-36">
          <div className="max-w-[600px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(233,196,106,0.28)] bg-[rgba(25,24,23,0.55)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-on-dark)] backdrop-blur-md">
              <ShieldCheck size={14} className="text-[var(--accent)]" />
              Trusted across 77 districts
            </div>

            <h1 className="heading-xl mt-5 text-[var(--text-on-dark)]">
              Logistics Reimagined
              <br />
              for <span className="text-gradient-on-dark">Modern Nepal</span>
            </h1>

            <p className="mt-6 max-w-[500px] text-base leading-relaxed text-[var(--text-on-dark-muted)] sm:text-lg">
              Seamless delivery solutions from the bustling streets of Kathmandu to the
              remote trails of the Himalayas. Experience speed, safety, and reliability.
            </p>

            <form
              onSubmit={handleTrack}
              className="mt-9 flex w-full max-w-[520px] flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-2.5 px-3">
                <MapPin size={18} className="shrink-0 text-[var(--accent)]" />
                <input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. LN-98742)"
                  className="h-11 w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
                  aria-label="Tracking ID"
                  suppressHydrationWarning
                />
              </div>
              <button type="submit" className="btn-primary sm:w-auto" suppressHydrationWarning>
                Track Now <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {["#E9C46A", "#C99A3D", "var(--accent-strong)"].map((c) => (
                  <span
                    key={c}
                    className="h-8 w-8 rounded-full border-2 border-[rgba(12,11,10,0.6)] shadow-sm"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="text-sm text-[var(--text-on-dark-muted)]">
                <span className="font-bold text-[var(--text-on-dark)]">1.2M+</span> successful deliveries this year
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
