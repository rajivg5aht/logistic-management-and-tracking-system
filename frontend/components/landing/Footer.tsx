"use client";

import Link from "next/link";

const footerLinks = {
  Product: ["Platform", "Pricing", "Integrations", "Enterprise"],
  Company: ["About Us", "Careers", "Press Kit", "Contact"],
  Support: ["Documentation", "Help Center", "API Status", "System Health"],
};

export default function Footer() {
  return (
    <footer className="relative bg-[#050816] border-t border-white/[0.04] pt-16">
      <div className="container-max">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-12 pb-12">
          {/* Brand - wider column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-5">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-white">Cargo</span><span className="text-[#00E5FF]">Nep</span>
            </Link>
            <p className="mt-4 text-sm text-white/30 leading-relaxed max-w-xs">
              Building the digital foundation for the next century of global transportation and intelligent commerce.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-2 md:col-span-2 col-span-1">
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.15em] mb-5">{title}</p>
              <ul className="space-y-3">
                {links.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/30 hover:text-[#00E5FF] transition-colors font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pb-10 pt-6 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">&copy; 2026 CargoNep Inc. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Security"].map((item) => (
              <a key={item} href="#" className="text-xs text-white/20 hover:text-white/40 transition-colors font-medium">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}