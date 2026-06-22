"use client";

import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  fullWidth?: boolean;
}

export default function Section({
  children,
  id,
  className = "",
  fullWidth = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative section ${className}`}
    >
      {fullWidth ? (
        <div className="container-full">{children}</div>
      ) : (
        <div className="container-max">{children}</div>
      )}
    </section>
  );
}