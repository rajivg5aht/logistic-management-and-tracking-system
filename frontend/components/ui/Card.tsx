"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: string;
}

export default function Card({
  children,
  className = "",
  hover = true,
  glow = true,
  padding,
}: CardProps) {
  return (
    <div
      className={`group relative card ${
        padding ? padding : ""
      } ${
        hover
          ? "hover:-translate-y-1.5 hover:border-[#00E5FF]/20 transition-all duration-500"
          : ""
      } ${glow ? "shadow-[0_0_1px_rgba(0,229,255,0.1)]" : ""} ${className}`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent rounded-[20px] pointer-events-none" />
      
      {/* Hover glow */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-transparent rounded-[20px] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
      )}
      
      {/* Subtle border glow on hover */}
      {hover && (
        <div className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none ring-1 ring-inset ring-[#00E5FF]/10" />
      )}
      
      <div className="relative">{children}</div>
    </div>
  );
}
