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
  padding = "p-8",
}: CardProps) {
  return (
    <div
      className={`group relative card ${padding} ${
        hover
          ? "hover:-translate-y-1.5 hover:border-[#00E5FF]/20 transition-all duration-500"
          : ""
      } ${glow ? "shadow-[0_0_1px_rgba(0,229,255,0.1)]" : ""} ${className}`}
    >
      {/* Hover glow */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
      )}
      
      <div className="relative">{children}</div>
    </div>
  );
}
