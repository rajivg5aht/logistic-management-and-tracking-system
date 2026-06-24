"use client";

import { Crosshair, Network, Truck, LineChart, Shield } from "lucide-react";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";

const bottomFeatures = [
  {
    icon: <Truck size={22} />,
    title: "Fleet Management",
    desc: "Full lifecycle monitoring for every vehicle in your organization.",
  },
  {
    icon: <LineChart size={22} />,
    title: "Predictive Analytics",
    desc: "Anticipate market shifts and supply chain bottlenecks before they happen.",
  },
  {
    icon: <Shield size={22} />,
    title: "Secure Ledger",
    desc: "Blockchain-verified manifest tracking for ultimate transparency.",
  },
];

function NightMapVisualization() {
  return (
    <svg className="w-full h-full opacity-70" viewBox="0 0 420 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M10 20 h400 M10 45 h400 M10 70 h400 M10 95 h400" stroke="rgba(255,247,232,0.05)" strokeWidth="0.8" />
      <path d="M30 5 v110 M80 5 v110 M130 5 v110 M180 5 v110 M230 5 v110 M280 5 v110 M330 5 v110 M380 5 v110" stroke="rgba(255,247,232,0.05)" strokeWidth="0.8" />
      <path d="M-10 -10 L430 100" stroke="rgba(255,247,232,0.08)" strokeWidth="1.5" />
      <path d="M-10 110 L430 20" stroke="rgba(255,247,232,0.07)" strokeWidth="1.2" />
      <path d="M10 60 Q140 100 210 50 T410 60" stroke="rgba(200,162,74,0.12)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M130 70 L180 50 L275 65" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 3" />
      <g transform="translate(275, 65)">
        <circle r="9" fill="url(#mapGlow)" opacity="0.7">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle r="3" fill="var(--accent)" />
        <circle r="1" fill="var(--text-on-dark)" />
      </g>
    </svg>
  );
}

export default function Features() {
  return (
    <Section id="features" className="bg-[var(--app-bg)]">
      <div className="section-header">
        <div className="section-tag"><span className="section-tag-dot" />Platform Features</div>
        <h2 className="heading-lg">Precision Engineered Features</h2>
        <p className="mt-4 body-text">Our platform integrates directly with your existing infrastructure to provide a unified command center for all logistics operations.</p>
      </div>

      {/* Top row - 2 large cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card padding="p-8" className="flex flex-col" hover={true} glow={true}>
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] border border-[rgba(200,162,74,0.20)] flex items-center justify-center text-[var(--accent)] flex-shrink-0">
              <Crosshair size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="heading-sm mb-2">Real-Time Tracking</h3>
              <p className="body-text-sm max-w-[520px]">GPS and IoT integration provide sub-meter accuracy for every asset in your fleet, with instant alerts for deviations or delays.</p>
            </div>
          </div>
          <div className="mt-6 bg-[rgba(246,241,231,0.75)] border border-[var(--border)] rounded-xl overflow-hidden p-2 flex items-center justify-center h-[110px]">
            <NightMapVisualization />
          </div>
        </Card>

        <Card padding="p-8" className="flex flex-col" hover={true} glow={true}>
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] border border-[rgba(200,162,74,0.20)] flex items-center justify-center text-[var(--accent)] flex-shrink-0">
              <Network size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="heading-sm mb-2">Route Optimization</h3>
              <p className="body-text-sm">Neural networks analyze weather, traffic, and fuel efficiency to calculate the optimal path in milliseconds.</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[var(--accent)] font-bold text-lg">24%</span>
              <span className="text-[var(--text-muted)] text-xs font-medium">Average Fuel Savings</span>
            </div>
            <div className="h-2 bg-[var(--surface-soft)] rounded-full overflow-hidden border border-[var(--border)]">
              <div className="h-full w-[24%] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] rounded-full shadow-[0_0_10px_rgba(200,162,74,0.4)]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom row - 3 smaller cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bottomFeatures.map((f) => (
          <Card key={f.title} padding="p-8" className="flex flex-col" hover={true} glow={true}>
            <div className="w-11 h-11 rounded-xl bg-[var(--accent-soft)] border border-[rgba(200,162,74,0.20)] flex items-center justify-center text-[var(--accent)] mb-5">
              {f.icon}
            </div>
            <h3 className="heading-sm mb-2">{f.title}</h3>
            <p className="body-text-sm">{f.desc}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
