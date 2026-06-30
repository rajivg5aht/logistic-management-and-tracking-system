"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Package,
  Award,
  Circle
} from "lucide-react";
import { AuthUser } from "@/lib/api/auth.api";

interface DriverConsoleProps {
  user: AuthUser;
}

export default function DriverConsole({ user }: DriverConsoleProps) {
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({
    vehicle: true,
    manifest: true,
    telemetry: false,
    departure: true
  });

  const toggleCheck = (key: string) => {
    setCompletedChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeShipment = {
    id: "#SH-8842",
    origin: "Chicago Warehouse Hub",
    destination: "Austin, TX (Distribution Center 4)",
    status: "In Transit",
    eta: "14:20 PM",
    cargo: "High-Priority Logistics Assets",
    weight: "2,400 kg"
  };

  const steps = [
    { label: "Manifest Verified", done: true },
    { label: "Vehicle Loaded", done: true },
    { label: "In Transit", active: true, done: false },
    { label: "Arrived", done: false }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Driver Welcome Banner */}
      <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#C99A3D]">
            Driver Dashboard
          </span>
          <h1 className="text-2xl font-black text-[#2D2D2D] tracking-tight">
            Welcome back, {user.fullName || "Driver"}
          </h1>
          <p className="text-[#9B9B9B] text-xs font-medium">
            Keep telemetry active while on route. Stay safe on the road!
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(95,127,53,0.1)] text-[#5F7F35] shrink-0">
          <CheckCircle2 size={24} className="stroke-[2.5]" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E6E1D6] rounded-xl p-4 shadow-sm text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#9B9B9B] uppercase tracking-wider">
              Active Shipments
            </span>
            <div className="text-[#C99A3D]">
              <Package size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#2D2D2D]">1</h3>
        </div>

        <div className="bg-white border border-[#E6E1D6] rounded-xl p-4 shadow-sm text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#9B9B9B] uppercase tracking-wider">
              Weekly Progress
            </span>
            <div className="text-[#C99A3D]">
              <TrendingUp size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#2D2D2D]">75%</h3>
        </div>

        <div className="bg-white border border-[#E6E1D6] rounded-xl p-4 shadow-sm text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#9B9B9B] uppercase tracking-wider">
              Trips Finished
            </span>
            <div className="text-[#C99A3D]">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#2D2D2D]">142</h3>
        </div>

        <div className="bg-white border border-[#E6E1D6] rounded-xl p-4 shadow-sm text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#9B9B9B] uppercase tracking-wider">
              Driver Rating
            </span>
            <div className="text-[#C99A3D]">
              <Award size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#2D2D2D] flex items-center gap-1">
            4.9 <span className="text-yellow-500 text-sm">★</span>
          </h3>
        </div>
      </div>

      {/* Main Two Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Route Details Card */}
        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-sm md:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E6E1D6] pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#2D2D2D]">Active Delivery Route</h2>
              <p className="text-xs text-[#9B9B9B] font-semibold mt-0.5">Order ID: {activeShipment.id}</p>
            </div>
            <span className="text-xs font-black bg-[#EAF1FC] text-[#3E80E5] px-3 py-1 rounded-full uppercase tracking-wider">
              {activeShipment.status}
            </span>
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full border-2 border-[#5F7F35] bg-[#EAF7F6] flex items-center justify-center text-xs font-black text-[#5F7F35] z-10 shrink-0">
                  A
                </div>
                <div className="h-12 w-0.5 bg-dashed border-l border-[#E6E1D6] my-1" />
              </div>
              <div className="text-left pt-0.5">
                <span className="text-[10px] font-bold text-[#9B9B9B] uppercase">Origin Location</span>
                <h4 className="text-sm font-bold text-[#2D2D2D]">{activeShipment.origin}</h4>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full border-2 border-[#C99A3D] bg-[#FDF6E2] flex items-center justify-center text-xs font-black text-[#C99A3D] z-10 shrink-0">
                B
              </div>
              <div className="text-left pt-0.5">
                <span className="text-[10px] font-bold text-[#9B9B9B] uppercase">Destination Target</span>
                <h4 className="text-sm font-bold text-[#2D2D2D]">{activeShipment.destination}</h4>
              </div>
            </div>
          </div>

          {/* Cargo Specs */}
          <div className="grid grid-cols-2 gap-4 bg-[#FAF9F6] p-4 rounded-xl border border-[#E6E1D6] text-left text-sm">
            <div>
              <span className="text-[10px] font-bold text-[#9B9B9B] uppercase block">Loaded Cargo</span>
              <span className="font-bold text-[#2D2D2D]">{activeShipment.cargo}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#9B9B9B] uppercase block">Gross Weight</span>
              <span className="font-bold text-[#2D2D2D]">{activeShipment.weight}</span>
            </div>
          </div>

          {/* Graphical Step Milestone indicator */}
          <div className="pt-4 space-y-3">
            <span className="text-[10px] font-bold text-[#9B9B9B] uppercase block text-left">Milestones</span>
            <div className="flex items-center justify-between relative px-2">
              <div className="absolute inset-x-4 top-3 h-0.5 bg-[#E6E1D6] z-0" />
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center z-10 relative">
                  {step.done ? (
                    <div className="h-6.5 w-6.5 rounded-full bg-[#5F7F35] text-white flex items-center justify-center">
                      <CheckCircle2 size={14} className="stroke-[2.5]" />
                    </div>
                  ) : step.active ? (
                    <div className="h-6.5 w-6.5 rounded-full border-2 border-[#C99A3D] bg-white flex items-center justify-center relative">
                      <Circle size={10} className="fill-[#C99A3D] text-[#C99A3D]" />
                      <span className="animate-ping absolute inset-0 rounded-full border-2 border-[#C99A3D] opacity-75"></span>
                    </div>
                  ) : (
                    <div className="h-6.5 w-6.5 rounded-full border-2 border-[#E6E1D6] bg-white flex items-center justify-center" />
                  )}
                  <span className="text-[10px] font-bold text-[#2D2D2D] mt-2 whitespace-nowrap hidden sm:block">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety / Duty Checklist Card */}
        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-sm flex flex-col gap-5 text-left">
          <div>
            <h2 className="text-lg font-extrabold text-[#2D2D2D]">Safety Checklist</h2>
            <p className="text-xs text-[#9B9B9B] font-semibold mt-0.5">Mandatory pre-trip duties</p>
          </div>

          <div className="flex-1 space-y-3">
            {/* vehicle checklist */}
            <div
              onClick={() => toggleCheck("vehicle")}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                completedChecklist.vehicle
                  ? "bg-[rgba(95,127,53,0.05)] border-[rgba(95,127,53,0.15)] text-[#5F7F35]"
                  : "bg-white border-[#E6E1D6] text-[#2D2D2D]"
              }`}
            >
              <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${completedChecklist.vehicle ? "text-[#5F7F35]" : "text-[#9B9B9B]"}`} />
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">Pre-Flight Inspections</span>
                <span className="text-[10px] text-[#9B9B9B] mt-0.5">Checked tire pressure and fuel level.</span>
              </div>
            </div>

            {/* manifest checklist */}
            <div
              onClick={() => toggleCheck("manifest")}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                completedChecklist.manifest
                  ? "bg-[rgba(95,127,53,0.05)] border-[rgba(95,127,53,0.15)] text-[#5F7F35]"
                  : "bg-white border-[#E6E1D6] text-[#2D2D2D]"
              }`}
            >
              <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${completedChecklist.manifest ? "text-[#5F7F35]" : "text-[#9B9B9B]"}`} />
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">Manifest Verified</span>
                <span className="text-[10px] text-[#9B9B9B] mt-0.5">Verified load sheets & security seals.</span>
              </div>
            </div>

            {/* telemetry checklist */}
            <div
              onClick={() => toggleCheck("telemetry")}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                completedChecklist.telemetry
                  ? "bg-[rgba(95,127,53,0.05)] border-[rgba(95,127,53,0.15)] text-[#5F7F35]"
                  : "bg-white border-[#E6E1D6] text-[#2D2D2D]"
              }`}
            >
              <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${completedChecklist.telemetry ? "text-[#5F7F35]" : "text-[#9B9B9B]"}`} />
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">Telemetry Enabled</span>
                <span className="text-[10px] text-[#9B9B9B] mt-0.5">GPS background tracking active.</span>
              </div>
            </div>

            {/* departure checklist */}
            <div
              onClick={() => toggleCheck("departure")}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                completedChecklist.departure
                  ? "bg-[rgba(95,127,53,0.05)] border-[rgba(95,127,53,0.15)] text-[#5F7F35]"
                  : "bg-white border-[#E6E1D6] text-[#2D2D2D]"
              }`}
            >
              <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${completedChecklist.departure ? "text-[#5F7F35]" : "text-[#9B9B9B]"}`} />
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">Log Departures</span>
                <span className="text-[10px] text-[#9B9B9B] mt-0.5">Recorded departure mileage logbook.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#C99A3D] font-bold bg-[#FDF6E2] p-3 rounded-xl border border-[rgba(233,196,106,0.25)]">
            <AlertCircle size={16} className="shrink-0" />
            <span>Keep your phone mounted while operating the vehicle.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
