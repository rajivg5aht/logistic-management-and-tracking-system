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
  glow = false,
  padding = "p-8",
}: CardProps) {
  return (
    <div
      className={`group relative card ${padding} ${
        hover ? "card-interactive" : ""
      } ${glow ? "shadow-[0_18px_46px_rgba(200,162,74,0.08)]" : ""} ${className}`}
    >
      {hover && (
        <div className="absolute inset-0 rounded-[inherit] bg-[rgba(200,162,74,0.04)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none" />
      )}
      
      <div className="relative">{children}</div>
    </div>
  );
}
