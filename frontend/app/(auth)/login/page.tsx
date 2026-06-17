"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import "./login.css";

/* ─── Ship Silhouette SVG ─── */
function ShipSVG() {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.15 }}>
      {/* Water line */}
      <path d="M0,400 Q200,380 400,390 Q600,400 800,385" fill="none" stroke="rgba(85,161,167,0.3)" strokeWidth="1" />
      <path d="M0,420 Q200,400 400,410 Q600,420 800,405" fill="none" stroke="rgba(85,161,167,0.15)" strokeWidth="0.5" />

      {/* Ship hull */}
      <path
        d="M150,350 L200,380 L600,380 L650,350 L630,300 L580,280 L550,250 L520,240 L500,245 L480,240 L350,240 L330,260 L200,280 L170,300 Z"
        fill="none"
        stroke="rgba(85,161,167,0.4)"
        strokeWidth="1.5"
      />

      {/* Containers on deck */}
      <rect x="250" y="250" width="60" height="30" fill="none" stroke="rgba(226,194,117,0.2)" strokeWidth="1" rx="2" />
      <rect x="320" y="245" width="60" height="35" fill="none" stroke="rgba(85,161,167,0.25)" strokeWidth="1" rx="2" />
      <rect x="390" y="248" width="60" height="32" fill="none" stroke="rgba(226,194,117,0.15)" strokeWidth="1" rx="2" />
      <rect x="460" y="250" width="50" height="30" fill="none" stroke="rgba(85,161,167,0.2)" strokeWidth="1" rx="2" />

      {/* Bridge */}
      <rect x="530" y="220" width="50" height="30" fill="none" stroke="rgba(85,161,167,0.3)" strokeWidth="1" rx="3" />
      <rect x="535" y="210" width="40" height="15" fill="none" stroke="rgba(226,194,117,0.2)" strokeWidth="1" rx="2" />

      {/* Mast / antenna */}
      <line x1="555" y1="210" x2="555" y2="170" stroke="rgba(85,161,167,0.3)" strokeWidth="1" />
      <circle cx="555" cy="168" r="3" fill="rgba(226,194,117,0.3)" />

      {/* Crane arms */}
      <line x1="300" y1="250" x2="280" y2="190" stroke="rgba(85,161,167,0.2)" strokeWidth="1" />
      <line x1="420" y1="248" x2="440" y2="185" stroke="rgba(85,161,167,0.2)" strokeWidth="1" />
    </svg>
  );
}

/* ─── Logo / Rocket Icon ─── */
function LogoIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 4L28 16L40 20L28 24L24 36L20 24L8 20L20 16L24 4Z"
        fill="#E2C275"
        filter="url(#iconGlow)"
      />
      <defs>
        <filter id="iconGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          <feComposite in="SourceGraphic" />
        </filter>
      </defs>
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
    <div className="login-page">
      {/* ═══ LEFT HERO ═══ */}
      <div className="login-hero">
        {/* Background glows */}
        <div className="login-hero-glow" />
        <div className="login-hero-gold-glow" />

        {/* Ship silhouette */}
        <div className="login-ship-container">
          <ShipSVG />
        </div>

        {/* Gradient overlay */}
        <div className="login-ship-overlay" />

        {/* Divider fade to right section */}
        <div className="login-divider-fade" />

        {/* Hero Content */}
        <div className="login-hero-content">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <LogoIcon />
            <span
              className="text-white"
              style={{ fontSize: '52px', fontWeight: 700, letterSpacing: '-1px' }}
            >
              Logi<span style={{ color: '#55A1A7' }}>Flow</span>
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 500,
              lineHeight: 1.4,
              color: '#DDF9FF',
              maxWidth: '500px',
            }}
          >
            High-Tech <span style={{ color: '#E2C275' }}>Orchestration</span> for
            Global Supply Chains.
          </h1>

          {/* Description */}
          <p
            className="mt-6"
            style={{
              fontSize: '18px',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.72)',
              maxWidth: '550px',
            }}
          >
            Experience the next generation of logistics management with real-time
            tracking, AI-driven routing, and seamless fleet coordination.
          </p>
        </div>
      </div>

      {/* ═══ RIGHT LOGIN SECTION ═══ */}
      <div className="login-form-section">
        {/* Floating orb */}
        <div className="login-orb" />

        {/* Glass glow */}
        <div className="login-form-glow" />

        {/* Form Wrapper */}
        <div className="login-form-wrapper">
          {/* Heading */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: 'white',
              marginBottom: '10px',
              lineHeight: 1.1,
            }}
          >
            Sign In
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.65)',
              marginBottom: '32px',
            }}
          >
            Enter your credentials to access the command center.
          </p>

          {/* Role Selector Tabs */}
          <div className="role-tabs mb-8">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                className={`role-tab ${activeRole === role ? 'active' : ''}`}
                onClick={() => setActiveRole(role)}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Login Form Component */}
          <LoginForm role={activeRole} />

          {/* Divider */}
          <div className="login-divider mt-6 mb-6">
            <div className="login-divider-line" />
            <span className="login-divider-text">OR CONTINUE WITH</span>
            <div className="login-divider-line" />
          </div>

          {/* Google Button */}
          <button type="button" className="google-btn">
            <GoogleIcon />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
