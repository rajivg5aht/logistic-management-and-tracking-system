"use client";

import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";

const steps = [
  {
    step: "01",
    title: "Connect Your Fleet",
    desc: "Integrate your existing fleet management systems with CargoNep in minutes. Our platform supports GPS trackers, IoT sensors, and all major logistics software via API.",
  },
  {
    step: "02",
    title: "Optimize Operations",
    desc: "AI-powered algorithms analyze routes, traffic patterns, weather data, and fuel consumption to generate the most efficient shipping plans across your entire network.",
  },
  {
    step: "03",
    title: "Track in Real Time",
    desc: "Monitor every shipment, vehicle, and asset with sub-meter precision. Receive instant alerts for deviations, delays, or maintenance needs before they impact your operations.",
  },
  {
    step: "04",
    title: "Scale with Confidence",
    desc: "Leverage predictive analytics and blockchain-verified logs to expand your logistics operations seamlessly. Make data-driven decisions that keep you ahead of demand.",
  },
];

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="section-header">
        <div className="section-tag"><span className="section-tag-dot" />How It Works</div>
        <h2 className="heading-lg">From setup to scale in<br />four simple steps</h2>
        <p className="mt-4 body-text">Get your logistics operation up and running on CargoNep with minimal friction and immediate value.</p>
      </div>

      {/* 2-column wide grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {steps.map((s) => (
          <Card key={s.step} padding="p-8" hover={true} glow={false} className="flex flex-col">
            <div className="w-14 h-14 rounded-full bg-[var(--accent-soft)] border border-[rgba(200,162,74,0.20)] flex items-center justify-center mb-6">
              <span className="text-[var(--accent)] text-lg font-bold">{s.step}</span>
            </div>
            <h3 className="heading-sm mb-3">{s.title}</h3>
            <p className="body-text-sm">{s.desc}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
