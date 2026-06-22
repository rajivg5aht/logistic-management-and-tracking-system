import { RegisterForm } from "@/components/auth/RegisterForm";

/* ─── Tilted Rocket Icon ─── */
function RocketIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-[#00F0FF]">
      <path d="M21 3s-3.5-.5-7.5 3.5c-3.2 3.2-4.5 7.2-4.5 7.2L10.3 15s4-1.3 7.2-4.5C21.5 6.5 21 3 21 3z" />
      <path d="M9.1 13.7L5.5 15.5l-3 6 6-3 1.8-3.6-1.2-1.2z" />
      <path d="M14.5 10.3l3.6-1.8 3-6-6 3-1.8 3.6 1.2 1.2z" />
      <path d="M3.7 18.8c-.8.8-1.2 2-1.2 2s1.2-.4 2-1.2l.6-.6-1.4-1.4v1.2z" />
      <circle cx="16" cy="8" r="1.5" fill="#0D0E12" />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050816] overflow-hidden relative p-4 md:p-8 font-sans">
      {/* ═══ BACKGROUND LAYERS ═══ */}
      {/* Blurred Cargo Ship Background */}
      <div 
        className="absolute inset-0 bg-[url('/cargo_ship_neon.png')] bg-cover bg-center opacity-25 filter blur-[3px] scale-105 pointer-events-none"
        aria-hidden="true"
      />
      {/* Dark Ambient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#050816] via-[#050816]/95 to-[#00E5FF]/10 pointer-events-none" />
      
      {/* Radial Glow Orbs */}
      <div className="absolute -top-[200px] -left-[200px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-[200px] -right-[200px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.04)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

      {/* ═══ CENTERED CARD CONTAINER ═══ */}
      <div className="relative z-10 w-full max-w-[500px] bg-[#0B1220]/50 backdrop-blur-2xl border border-white/[0.07] rounded-[32px] p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden group">
        {/* Top Edge Gradient Line */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent pointer-events-none" />
        
        {/* Glow overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.02] via-transparent to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2.5 mb-3.5 group-hover:scale-105 transition-transform duration-300">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-transparent border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
              <RocketIcon />
            </div>
            <span className="text-white text-3xl font-extrabold tracking-tight">
              CargoNep
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Get Started
          </h1>
          <p className="text-sm text-white/50 max-w-[320px]">
            Register your workspace & start tracking.
          </p>
        </div>

        {/* Register Form Component */}
        <RegisterForm />
      </div>
    </div>
  );
}

