import { RegisterForm } from "@/components/auth/RegisterForm";
import RocketIcon from "@/components/auth/RocketIcon";

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
      <div className="relative z-10 w-full max-w-[500px] bg-[#0B1220]/50 backdrop-blur-2xl border border-white/[0.07] rounded-2xl p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden group">
        {/* Top Edge Gradient Line */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent pointer-events-none" />
        
        {/* Glow overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.02] via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

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
          <p className="text-sm text-white/60 max-w-[320px]">
            Register your workspace & start tracking.
          </p>
        </div>

        {/* Register Form Component */}
        <RegisterForm />
      </div>
    </div>
  );
}

