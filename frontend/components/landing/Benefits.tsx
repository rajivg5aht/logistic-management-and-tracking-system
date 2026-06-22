"use client";

import { Shield, Zap, BarChart3, Clock, Users, Globe } from "lucide-react";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";

const benefits = [
  {
    icon: <Zap size={22} />,
    title: "Reduce Costs by 34%",
    desc: "AI-optimized routing and fuel management cut operational expenses significantly, with most clients seeing ROI within the first 90 days.",
  },
  {
    icon: <Clock size={22} />,
    title: "99.9% Uptime Guarantee",
    desc: "Enterprise-grade infrastructure ensures your logistics operations never skip a beat. Real-time failover and redundant systems keep you online.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "94% Forecast Accuracy",
    desc: "Machine learning models trained on billions of data points predict demand shifts and supply chain disruptions weeks in advance.",
  },
  {
    icon: <Shield size={22} />,
    title: "Blockchain Security",
    desc: "Every shipment is logged on an immutable ledger, providing complete chain of custody documentation and tamper-proof audit trails.",
  },
  {
    icon: <Users size={22} />,
    title: "Team Collaboration",
    desc: "Role-based dashboards and real-time notifications keep your entire logistics team aligned, from dispatchers to C-suite executives.",
  },
  {
    icon: <Globe size={22} />,
    title: "Global Coverage",
    desc: "Operate in over 190 countries with localized compliance, multi-currency support, and integration with regional carriers and customs systems.",
  },
];

export default function Benefits() {
  return (
    <Section id="benefits" className="scroll-mt-20">
      <div className="glow-orb glow-orb-xl" style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }} />
      <div className="section-header">
        <div className="section-tag">Why CargoNep</div>
        <h2 className="heading-lg">Built for logistics teams<br />that demand more</h2>
        <p className="mt-4 body-text">Thousands of enterprises trust CargoNep to power their global supply chains with cutting-edge technology and enterprise-grade reliability.</p>
      </div>

      {/* 3-column wide grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {benefits.map((b) => (
          <Card key={b.title} padding="p-10" className="flex flex-col min-w-[280px]">
            <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] mb-5">
              {b.icon}
            </div>
            <h3 className="heading-sm mb-2">{b.title}</h3>
            <p className="body-text-sm">{b.desc}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}