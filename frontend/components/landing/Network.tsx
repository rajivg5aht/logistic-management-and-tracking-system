import Link from "next/link";
import Image from "next/image";
import { Navigation } from "lucide-react";

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
                <Image
                  src="/nepal%20map.png"
                  alt="Map of Nepal showing our nationwide delivery coverage"
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
