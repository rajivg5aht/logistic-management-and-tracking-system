"use client";

import { Truck } from "lucide-react";
import Link from "next/link";

export function ActiveShipmentCard() {
  return (
    <div className="app-card overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Teal Map */}
        <div className="relative flex min-h-[200px] items-center justify-center bg-[#0e7c7b] p-6">
          {/* World map placeholder - simplified geometric representation */}
          <svg
            className="absolute inset-0 h-full w-full opacity-20"
            viewBox="0 0 400 200"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          >
            {/* Simplified continent shapes */}
            <path d="M50 80 Q80 60 120 75 T180 70 T240 85 T300 75" />
            <path d="M280 100 Q320 90 350 110 T380 130" />
            <path d="M100 120 Q140 110 180 125 T240 115" />
            <circle cx="200" cy="100" r="3" fill="white" />
          </svg>

          {/* Truck marker */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Truck size={32} className="text-white" strokeWidth={2} />
          </div>

          {/* In Transit badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              In Transit
            </span>
          </div>
        </div>

        {/* Right: Shipment Details */}
        <div className="flex flex-col justify-between p-6 lg:p-8">
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)]">Shipment ID #LP-92841-B</p>
            <h3 className="mt-2 text-xl font-bold text-[var(--text)] lg:text-2xl">Luxury Silk Textiles</h3>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
                <span>In Transit</span>
                <span>75%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div className="h-full w-3/4 rounded-full bg-[var(--accent)]" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {/* Est. Delivery */}
            <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-soft)] px-4 py-2">
              <svg
                className="h-4 w-4 text-[var(--accent)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-sm font-semibold text-[var(--accent)]">Est. Delivery: Tomorrow</span>
            </div>

            {/* Current Location */}
            <Link
              href="/tracking/LP-92841-B"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors no-underline"
            >
            <MapPinned className="h-4 w-4" />
              <span>Distribution Hub, PK</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPinned(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}