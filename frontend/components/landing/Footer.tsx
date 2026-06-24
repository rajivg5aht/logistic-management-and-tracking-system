"use client";

import Link from "next/link";

const footerLinks = {
  Product: ["Platform", "Pricing", "Integrations", "Enterprise"],
  Company: ["About Us", "Careers", "Press Kit", "Contact"],
  Support: ["Documentation", "Help Center", "API Status", "System Health"],
};

export default function Footer() {
  return (
    <footer className="relative bg-[var(--app-bg)] border-t border-[var(--border)] pt-16">
      <div className="container-max">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-12 pb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-[var(--text)]">Cargo</span><span className="text-[var(--accent)]">Nep</span>
            </Link>
            <p className="mt-4 text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              Building the digital foundation for the next century of global transportation and intelligent commerce.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-5">{title}</p>
              <ul className="space-y-3">
                {links.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pb-10 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">&copy; 2026 CargoNep Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security"].map((item) => (
              <a key={item} href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-muted)] transition-colors font-medium">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
              { label: "GitHub", path: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" }
            ].map(({ label, path }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text-muted)] transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
