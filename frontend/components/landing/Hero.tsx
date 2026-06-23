"use client";

import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";

function WorldMapVisualization() {
  return (
    <svg viewBox="0 0 600 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="glowPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0" />
          <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 15} x2="600" y2={i * 15} stroke="rgba(0,229,255,0.03)" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 40 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 15} y1="0" x2={i * 15} y2="360" stroke="rgba(0,229,255,0.03)" strokeWidth="0.5" />
      ))}
      <path d="M70,70 Q82,55 108,50 Q132,44 156,55 L174,70 Q186,92 180,115 L168,134 Q154,144 134,139 L108,134 Q86,126 76,110 L68,90 Z" fill="rgba(0,229,255,0.05)" stroke="rgba(0,229,255,0.2)" strokeWidth="0.8" />
      <path d="M134,174 Q150,163 168,174 L178,197 Q180,228 170,252 L158,269 Q142,274 132,257 L126,228 Q122,197 130,180 Z" fill="rgba(0,229,255,0.04)" stroke="rgba(0,229,255,0.15)" strokeWidth="0.8" />
      <path d="M276,54 Q298,46 314,58 L324,78 Q322,94 310,91 L290,84 Q278,74 276,62 Z" fill="rgba(0,229,255,0.05)" stroke="rgba(0,229,255,0.2)" strokeWidth="0.8" />
      <path d="M294,110 Q314,100 334,115 L344,146 Q346,187 336,218 L324,240 Q305,247 293,230 L283,197 Q278,156 285,126 Z" fill="rgba(0,229,255,0.04)" stroke="rgba(0,229,255,0.15)" strokeWidth="0.8" />
      <path d="M342,46 Q384,36 426,48 L470,68 Q488,90 475,115 L446,126 Q412,120 384,108 L355,89 Q338,67 342,50 Z" fill="rgba(0,229,255,0.05)" stroke="rgba(0,229,255,0.2)" strokeWidth="0.8" />
      <path d="M480,204 Q510,192 528,209 L530,230 Q518,247 497,240 L482,223 Z" fill="rgba(0,229,255,0.04)" stroke="rgba(0,229,255,0.15)" strokeWidth="0.8" />
      {[
        { x1: 120, y1: 90, x2: 300, y2: 70 },
        { x1: 300, y1: 70, x2: 414, y2: 74 },
        { x1: 414, y1: 74, x2: 504, y2: 216 },
        { x1: 120, y1: 90, x2: 150, y2: 186 },
        { x1: 300, y1: 70, x2: 312, y2: 146 },
        { x1: 414, y1: 74, x2: 312, y2: 146 },
        { x1: 150, y1: 186, x2: 312, y2: 146 },
        { x1: 312, y1: 146, x2: 340, y2: 190 },
      ].map((r, i) => (
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="url(#routeGrad)" strokeWidth="1.2" opacity="0.5" filter="url(#glow)">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${3 + i * 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </line>
      ))}
      {[
        { cx: 120, cy: 90 },
        { cx: 300, cy: 70 },
        { cx: 414, cy: 74 },
        { cx: 504, cy: 216 },
        { cx: 150, cy: 186 },
        { cx: 312, cy: 146 },
        { cx: 340, cy: 190 },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r={12} fill="url(#glowPulse)" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={n.cx} cy={n.cy} r={4} fill="#00E5FF" filter="url(#glow)">
            <animate attributeName="r" values="3.5;5;3.5" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={n.cx} cy={n.cy} r={1.5} fill="#ffffff" opacity="0.95" />
        </g>
      ))}
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#050816] pt-[80px] pb-20">
      {/* Background glow orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.04)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-[-300px] right-[-200px] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.04)_0%,transparent_70%)] blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-350px] left-[-250px] w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.02)_0%,transparent_70%)] blur-[130px] pointer-events-none" />

      <div className="container-max">
        {/* Two-column grid: left ~45%, right ~55%, gap 48-64px */}
        <div className="grid grid-cols-1 lg:grid-cols-[45fr_55fr] items-center gap-12 lg:gap-16">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <div className="section-tag">
              <span className="section-tag-dot" />
              Next-Gen Logistics Engine
            </div>

            <h1 className="heading-xl">
              Smart Logistics for a
              <br />
              <span className="text-gradient">Connected World</span>
            </h1>

            <p className="mt-6 body-text max-w-[520px] mx-auto lg:mx-0">
              Harness the power of AI-driven route optimization and real-time fleet tracking to transform your global supply chain into a high-performance machine.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/login" className="btn-primary">
                Get Started <ArrowRight size={16} className="ml-1.5" />
              </Link>
              <Link href="#features" className="btn-secondary">Watch Demo</Link>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#00E5FF]/10 via-transparent to-[#00B8FF]/5 rounded-2xl blur-2xl opacity-70 pointer-events-none" />
            <div className="relative bg-[#0B1220]/45 backdrop-blur-md border border-white/[0.05] rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group">
              <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
              <div className="bg-[#050816]/75 border border-white/[0.02] rounded-2xl overflow-hidden p-1.5 aspect-[1.6] flex items-center justify-center">
                <WorldMapVisualization />
              </div>
              <div className="absolute bottom-7 left-7 right-7 bg-[#0B1220]/80 backdrop-blur-lg border border-[#00E5FF]/15 rounded-xl p-4 flex items-center justify-between shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)] flex-shrink-0">
                    <Rocket size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold">Active Shipments</p>
                    <p className="text-xl font-bold text-white tracking-tight leading-none mt-1">12,482</p>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-7">
                  <div className="w-2 bg-[#00E5FF] rounded-t-[2px] h-[35%] opacity-80" />
                  <div className="w-2 bg-[#00E5FF] rounded-t-[2px] h-[100%] shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
                  <div className="w-2 bg-[#00E5FF] rounded-t-[2px] h-[55%] opacity-90" />
                  <div className="w-2 bg-[#00E5FF] rounded-t-[2px] h-[80%] shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050816] to-transparent pointer-events-none" />
    </section>
  );
}