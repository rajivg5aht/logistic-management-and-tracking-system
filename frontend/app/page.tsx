import Link from "next/link";
import "./landing.css";

/* ─── SVG Icon Components ─── */
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A2A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A2A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#55A1A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16,8 20,8 23,11 23,16 16,16" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#55A1A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#55A1A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#55A1A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#55A1A7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

/* ─── World Map SVG ─── */
function WorldMapSVG() {
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Grid lines */}
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(85,161,167,0.08)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="360" height="200" fill="url(#grid)" />

      {/* Simplified continent outlines */}
      {/* North America */}
      <path d="M60,40 Q80,30 100,35 L110,50 Q115,65 105,80 L90,85 Q70,80 60,65 Z" fill="none" stroke="rgba(85,161,167,0.25)" strokeWidth="1" />
      {/* South America */}
      <path d="M95,100 Q105,95 110,105 L115,130 Q110,150 100,155 L90,145 Q85,125 90,110 Z" fill="none" stroke="rgba(85,161,167,0.25)" strokeWidth="1" />
      {/* Europe */}
      <path d="M170,35 Q185,30 195,40 L200,55 Q195,60 185,58 L175,50 Z" fill="none" stroke="rgba(85,161,167,0.25)" strokeWidth="1" />
      {/* Africa */}
      <path d="M180,70 Q195,65 205,75 L210,110 Q205,135 190,140 L180,125 Q175,100 178,80 Z" fill="none" stroke="rgba(85,161,167,0.25)" strokeWidth="1" />
      {/* Asia */}
      <path d="M210,30 Q240,25 270,35 L290,50 Q295,70 280,80 L250,75 Q225,65 215,50 Z" fill="none" stroke="rgba(85,161,167,0.25)" strokeWidth="1" />
      {/* Australia */}
      <path d="M280,120 Q300,115 310,125 L305,140 Q295,145 285,138 Z" fill="none" stroke="rgba(85,161,167,0.25)" strokeWidth="1" />

      {/* Connection lines with glow */}
      <line x1="85" y1="55" x2="185" y2="45" stroke="#55A1A7" strokeWidth="1" opacity="0.5" className="map-pulse" />
      <line x1="185" y1="45" x2="250" y2="50" stroke="#55A1A7" strokeWidth="1" opacity="0.5" className="map-pulse" style={{ animationDelay: '0.5s' }} />
      <line x1="250" y1="50" x2="295" y2="130" stroke="#E2C275" strokeWidth="1" opacity="0.4" className="map-pulse" style={{ animationDelay: '1s' }} />
      <line x1="85" y1="55" x2="100" y2="120" stroke="#E2C275" strokeWidth="1" opacity="0.4" className="map-pulse" style={{ animationDelay: '1.5s' }} />
      <line x1="185" y1="45" x2="190" y2="100" stroke="#55A1A7" strokeWidth="1" opacity="0.3" className="map-pulse" style={{ animationDelay: '0.8s' }} />

      {/* Node dots */}
      <circle cx="85" cy="55" r="4" fill="#55A1A7" opacity="0.9">
        <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="185" cy="45" r="4" fill="#55A1A7" opacity="0.9">
        <animate attributeName="r" values="3;5;3" dur="3s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="250" cy="50" r="4" fill="#E2C275" opacity="0.9">
        <animate attributeName="r" values="3;5;3" dur="3s" begin="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="295" cy="130" r="3" fill="#55A1A7" opacity="0.7">
        <animate attributeName="r" values="2;4;2" dur="3s" begin="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="120" r="3" fill="#E2C275" opacity="0.7">
        <animate attributeName="r" values="2;4;2" dur="3s" begin="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="190" cy="100" r="3" fill="#55A1A7" opacity="0.7">
        <animate attributeName="r" values="2;4;2" dur="3s" begin="0.3s" repeatCount="indefinite" />
      </circle>

      {/* Glow halos around major nodes */}
      <circle cx="85" cy="55" r="12" fill="none" stroke="#55A1A7" strokeWidth="0.5" opacity="0.3" className="map-pulse" />
      <circle cx="185" cy="45" r="12" fill="none" stroke="#55A1A7" strokeWidth="0.5" opacity="0.3" className="map-pulse" style={{ animationDelay: '0.5s' }} />
      <circle cx="250" cy="50" r="12" fill="none" stroke="#E2C275" strokeWidth="0.5" opacity="0.3" className="map-pulse" style={{ animationDelay: '1s' }} />
    </svg>
  );
}

/* ─── Quote Icon ─── */
function QuoteIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#E2C275" opacity="0.3">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}

/* ═══════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════ */
export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#F8F7F4' }}>

      {/* ═══ HEADER / NAVIGATION ═══ */}
      <header
        className="header-glass sticky top-0 z-50 w-full"
        style={{ background: '#121A2D', height: '70px' }}
      >
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 text-2xl font-bold" style={{ letterSpacing: '-0.5px' }}>
            <span style={{ color: '#FFFFFF' }}>Logi</span>
            <span style={{ color: '#55A1A7' }}>Flow</span>
          </Link>

          {/* Nav Links — Desktop */}
          <nav className="nav-links-desktop hidden items-center gap-8 md:flex">
            {[
              { label: 'Dashboard', active: true },
              { label: 'Shipments', active: false },
              { label: 'Fleet', active: false },
              { label: 'Drivers', active: false },
              { label: 'Analytics', active: false },
            ].map((item) => (
              <a
                key={item.label}
                href="#"
                className={`nav-link text-sm font-medium uppercase tracking-wide ${item.active ? 'active' : ''}`}
                style={{
                  color: item.active ? '#55A1A7' : '#A0A2A5',
                  fontSize: '14px',
                  borderBottom: item.active ? '2px solid #55A1A7' : 'none',
                  paddingBottom: '4px',
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Actions — Desktop */}
          <div className="nav-actions-desktop hidden items-center gap-3 md:flex">
            <button className="p-2 rounded-lg transition hover:bg-white/5" aria-label="Notifications">
              <BellIcon />
            </button>
            <button className="p-2 rounded-lg transition hover:bg-white/5" aria-label="Settings">
              <SettingsIcon />
            </button>
            <a
              href="#"
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-white/5"
              style={{ borderColor: '#E5E5E5', color: '#FFFFFF' }}
            >
              Global View
            </a>
            <Link
              href="/login"
              className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: '#E2C275', color: '#121A2D', borderRadius: '8px' }}
            >
              Create Shipment
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn hidden items-center justify-center rounded-lg p-2 transition hover:bg-white/10"
            style={{ display: 'none' }}
            aria-label="Menu"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden" style={{ background: '#F8F7F4' }}>
        <div
          className="hero-grid mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-20 lg:py-28"
          style={{ gridTemplateColumns: '1fr 1fr' }}
        >
          {/* Left Content */}
          <div className="fade-up">
            {/* Badge */}
            <span
              className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ background: '#146571', color: '#55A1A7', borderRadius: '20px', fontSize: '10px' }}
            >
              Next-Gen Logistics Engine
            </span>

            {/* Heading */}
            <h1 className="mt-6 fade-up fade-up-delay-1" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, lineHeight: 1.1 }}>
              <span style={{ color: '#222222' }}>Smart Logistics for a</span>
              <br />
              <span style={{ color: '#55A1A7' }}>Connected World</span>
            </h1>

            {/* Description */}
            <p
              className="mt-6 fade-up fade-up-delay-2"
              style={{ color: '#A0A2A5', fontSize: '16px', lineHeight: 1.7, maxWidth: '450px' }}
            >
              Harness the power of AI-driven route optimization, real-time fleet tracking, and predictive analytics to transform your supply chain into a competitive advantage.
            </p>

            {/* Buttons */}
            <div className="hero-buttons mt-8 flex items-center gap-4 fade-up fade-up-delay-3">
              <Link
                href="/login"
                className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                style={{ background: '#E2C275', color: '#121A2D', borderRadius: '10px', minWidth: '120px', height: '45px', justifyContent: 'center' }}
              >
                Get Started <ArrowRightIcon />
              </Link>
              <a
                href="#"
                className="btn-secondary inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium"
                style={{ borderColor: '#E5E5E5', color: '#222222', borderRadius: '10px', height: '45px' }}
              >
                <PlayIcon /> Watch Demo
              </a>
            </div>
          </div>

          {/* Right — Hero Map Card */}
          <div className="hero-card-float fade-up fade-up-delay-2 flex justify-center">
            <div
              className="relative overflow-hidden"
              style={{
                width: '100%',
                maxWidth: '440px',
                height: '380px',
                background: '#146571',
                border: '1px solid #33919A',
                borderRadius: '24px',
                padding: '24px',
              }}
            >
              {/* Map illustration */}
              <div className="relative z-10 h-full w-full overflow-hidden rounded-xl" style={{ opacity: 0.9 }}>
                <WorldMapSVG />
              </div>

              {/* Decorative glow */}
              <div
                className="absolute"
                style={{
                  top: '-30%',
                  right: '-20%',
                  width: '300px',
                  height: '300px',
                  background: 'radial-gradient(circle, rgba(85,161,167,0.3) 0%, transparent 70%)',
                  borderRadius: '50%',
                  zIndex: 0,
                }}
              />

              {/* Active Shipments overlay card */}
              <div
                className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between rounded-xl px-5 py-4"
                style={{ background: '#121A2D', borderRadius: '12px' }}
              >
                <div>
                  <p style={{ color: '#A0A2A5', fontSize: '12px', fontWeight: 500 }}>Active Shipments</p>
                  <p style={{ color: '#55A1A7', fontSize: '28px', fontWeight: 700 }}>12,482</p>
                </div>
                {/* Mini bar chart */}
                <div className="bar-chart flex items-end gap-1" style={{ height: '40px' }}>
                  {[20, 32, 16, 28, 24].map((h, i) => (
                    <div key={i} className="bar" style={{ width: '8px', background: '#E2C275', borderRadius: '2px', height: `${h}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="py-20" style={{ background: '#F8F7F4' }}>
        <div className="mx-auto max-w-[1200px] px-6">
          {/* Section header */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#222222' }}>
              Precision Engineered Features
            </h2>
            <p className="mt-4 text-base" style={{ color: '#A0A2A5', maxWidth: '500px', margin: '16px auto 0' }}>
              Every tool designed with enterprise-grade reliability and cutting-edge intelligence.
            </p>
          </div>

          {/* Top feature cards — 2-column */}
          <div className="features-grid mb-6 grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
            {/* Main Feature Card */}
            <div
              className="feature-card overflow-hidden rounded-2xl border"
              style={{ background: '#FFFFFF', borderColor: '#E5E5E5', borderRadius: '20px' }}
            >
              <div className="p-8">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: '#146571' }}
                >
                  <GlobeIcon />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#222222' }}>
                  Real-Time Global Tracking
                </h3>
                <p className="mt-2 text-sm" style={{ color: '#A0A2A5', maxWidth: '400px' }}>
                  Monitor every shipment across continents with millisecond precision. Our satellite-linked network provides uninterrupted visibility.
                </p>
              </div>
              {/* Map texture bottom */}
              <div
                className="map-texture relative h-40 w-full overflow-hidden"
                style={{ borderRadius: '0 0 20px 20px' }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-60">
                  <WorldMapSVG />
                </div>
              </div>
            </div>

            {/* Side Feature Card */}
            <div
              className="feature-card flex flex-col justify-between rounded-2xl border p-8"
              style={{ background: '#FFFFFF', borderColor: '#E5E5E5', borderRadius: '20px' }}
            >
              <div>
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: '#146571' }}
                >
                  <RouteIcon />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#222222' }}>
                  Route Optimization
                </h3>
                <p className="mt-2 text-sm" style={{ color: '#A0A2A5' }}>
                  AI algorithms calculate optimal paths, reducing fuel costs and delivery times by up to 24%.
                </p>
              </div>
              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#222222', fontWeight: 600 }}>24% Average Fuel Savings</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: '#E5E5E5' }}>
                  <div className="progress-bar-fill h-full rounded-full" style={{ background: '#33919A' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 small feature cards */}
          <div className="features-grid grid gap-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { icon: <TruckIcon />, title: 'Fleet Management', desc: 'Centralized control over every vehicle in your fleet with maintenance alerts.' },
              { icon: <ChartIcon />, title: 'Predictive Analytics', desc: 'Machine learning models forecast demand, delays, and resource needs.' },
              { icon: <ShieldIcon />, title: 'Secure Ledger', desc: 'Blockchain-verified records for tamper-proof supply chain documentation.' },
            ].map((f) => (
              <div
                key={f.title}
                className="feature-card flex items-start gap-4 rounded-2xl border p-6"
                style={{ background: '#FFFFFF', borderColor: '#E5E5E5', borderRadius: '20px', minHeight: '120px' }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: '#146571' }}
                >
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: '#222222' }}>{f.title}</h4>
                  <p className="mt-1 text-sm" style={{ color: '#A0A2A5' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS SECTION ═══ */}
      <section className="py-20" style={{ background: '#121A2D' }}>
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Trusted by Industry Leaders
            </h2>
            <p className="mt-4 text-base" style={{ color: '#A0A2A5' }}>
              See how logistics enterprises worldwide rely on LogiFlow.
            </p>
          </div>

          <div className="testimonials-grid grid gap-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              {
                quote: "LogiFlow transformed our entire supply chain. We reduced delivery times by 35% and cut operational costs significantly in just three months.",
                name: "Sarah Chen",
                role: "VP Operations, GlobalFreight Inc.",
                initials: "SC",
              },
              {
                quote: "The predictive analytics alone saved us millions. We can now forecast demand with 94% accuracy and optimize our fleet deployment accordingly.",
                name: "Marcus Rivera",
                role: "CTO, SwiftCargo Solutions",
                initials: "MR",
              },
              {
                quote: "Real-time tracking and AI-driven routing gave us a competitive edge we never had before. Our clients trust us more because they can see everything.",
                name: "Emily Tanaka",
                role: "Director of Logistics, OceanBridge",
                initials: "ET",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="testimonial-card flex flex-col justify-between rounded-2xl border p-8"
                style={{ background: '#FFFFFF', borderColor: '#E5E5E5', borderRadius: '16px' }}
              >
                <div>
                  <QuoteIcon />
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: '#222222' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: '#146571' }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#222222' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#A0A2A5' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-20" style={{ background: '#F8F7F4' }}>
        <div className="mx-auto max-w-[1200px] px-6">
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-16 text-center md:px-16 md:py-20"
            style={{ background: '#146571', borderRadius: '30px' }}
          >
            {/* Decorative glow */}
            <div
              className="absolute"
              style={{
                top: '-100px',
                right: '-100px',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(226,194,117,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
              }}
            />
            <div
              className="absolute"
              style={{
                bottom: '-80px',
                left: '-80px',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(85,161,167,0.2) 0%, transparent 70%)',
                borderRadius: '50%',
              }}
            />

            <h2 className="relative z-10 text-3xl font-bold text-white md:text-4xl">
              Ready to Optimize Your Fleet?
            </h2>
            <p className="relative z-10 mx-auto mt-4 text-base" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '500px' }}>
              Join thousands of logistics leaders who trust LogiFlow to power their operations.
            </p>
            <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold"
                style={{ background: '#E2C275', color: '#121A2D', borderRadius: '10px' }}
              >
                Start Free Trial <ArrowRightIcon />
              </Link>
              <a
                href="#"
                className="btn-secondary inline-flex items-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-medium"
                style={{ borderColor: '#E5E5E5', color: '#FFFFFF', borderRadius: '10px' }}
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-16" style={{ background: '#121A2D' }}>
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="footer-grid grid gap-12" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
            {/* Brand */}
            <div>
              <Link href="/" className="text-2xl font-bold" style={{ letterSpacing: '-0.5px' }}>
                <span style={{ color: '#FFFFFF' }}>Logi</span>
                <span style={{ color: '#55A1A7' }}>Flow</span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: '#A0A2A5', maxWidth: '280px' }}>
                Powering the next generation of logistics with AI-driven intelligence and real-time visibility.
              </p>
            </div>
            {/* Product */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Integrations', 'Pricing', 'Changelog'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm transition hover:text-white" style={{ color: '#A0A2A5' }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Press'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm transition hover:text-white" style={{ color: '#A0A2A5' }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Support */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Support</h4>
              <ul className="space-y-3">
                {['Documentation', 'API Reference', 'Status', 'Contact'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm transition hover:text-white" style={{ color: '#A0A2A5' }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider + Copyright */}
          <div className="mt-12 border-t pt-8" style={{ borderColor: 'rgba(229,229,229,0.15)' }}>
            <p className="text-sm" style={{ color: '#A0A2A5' }}>
              © {new Date().getFullYear()} LogiFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
