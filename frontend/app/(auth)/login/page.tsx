"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

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

/* ─── Google Icon ─── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const roles = ["Admin", "Driver", "Customer"] as const;

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<string>("Admin");

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
      <div className="relative z-10 w-full max-w-[460px] bg-[#0B1220]/50 backdrop-blur-2xl border border-white/[0.07] rounded-[32px] p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden group">
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
            Welcome Back
          </h1>
          <p className="text-sm text-white/50 max-w-[280px]">
            Enter your credentials to access the command center.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div 
          className="h-11 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center p-[3px] gap-[2px] mb-6.5"
          suppressHydrationWarning
        >
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              className={`flex-1 h-full flex items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-300 border border-transparent cursor-pointer ${
                activeRole === role
                  ? "bg-[#00E5FF]/10 border-[#00E5FF]/20 text-[#00E5FF] shadow-[0_2px_10px_rgba(0,229,255,0.08)]"
                  : "text-white/45 hover:text-white/80"
              }`}
              onClick={() => setActiveRole(role)}
              suppressHydrationWarning
            >
              {role}
            </button>
          ))}
        </div>

        {/* Login Form Component */}
        <LoginForm role={activeRole} />

        {/* Divider */}
        <div className="flex items-center gap-4 mt-8 mb-6">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-white/25 text-[10px] tracking-[1.5px] font-bold uppercase whitespace-nowrap">
            OR CONTINUE WITH
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Google Button */}
        <button 
          type="button" 
          className="w-full h-12 rounded-xl bg-white/[0.02] border border-white/[0.08] text-white font-medium text-sm flex items-center justify-center gap-2.5 transition-all duration-350 hover:border-white/20 hover:bg-white/5 cursor-pointer"
          suppressHydrationWarning
        >
          <GoogleIcon />
          Google
        </button>
      </div>
    </div>
  );
}