"use client";

import Link from "next/link";
import { Send } from "lucide-react";

const footerLinks = {
  Company: ["About Us", "Our Riders", "Careers", "Newsroom"],
  Services: ["Book a Shipment", "Real-time Tracking", "Cash on Delivery", "Business API"],
};

const socials = [
  { label: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
];

export default function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-[var(--surface-dark)] pt-16 text-[var(--text-on-dark)]">
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(200,162,74,0.18)] to-transparent" />

      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 pb-12 md:grid-cols-4 lg:grid-cols-[2.2fr_1fr_1fr_1.6fr] lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-[var(--text-on-dark)]">Cargo</span>
              <span className="text-[var(--accent)]">Nep</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-on-dark-muted)]">
              Bridging the logistics gap across the mountains of Nepal — delivering trust, speed, and
              transparency to every doorstep.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] text-[var(--text-on-dark-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-on-dark-muted)]">{title}</p>
              <ul className="space-y-3">
                {links.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm font-medium text-[var(--text-on-dark-muted)] transition-colors hover:text-[var(--accent)]">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-on-dark-muted)]">Stay Updated</p>
            <p className="mb-4 text-sm leading-relaxed text-[var(--text-on-dark-muted)]">
              Get the latest logistics news and delivery insights.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] p-1.5">
              <input suppressHydrationWarning
                type="email"
                required
                placeholder="Enter your email"
                aria-label="Email address"
                className="h-10 w-full bg-transparent px-3 text-sm text-[var(--text-on-dark)] outline-none placeholder:text-[var(--text-on-dark-muted)]"
              />
              <button suppressHydrationWarning
                type="submit"
                aria-label="Subscribe"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--text-on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.10)] pb-10 pt-6 md:flex-row">
          <p className="text-xs text-[var(--text-on-dark-muted)]">&copy; 2026 CargoNep Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="text-xs font-medium text-[var(--text-on-dark-muted)] transition-colors hover:text-[var(--accent)]">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
