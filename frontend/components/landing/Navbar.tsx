"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", id: "hero", href: "#" },
  { label: "Categories", id: "categories", href: "#categories" },
  { label: "Products", id: "products", href: "#products" },
  { label: "Features", id: "features", href: "#features" },
  { label: "Why CargoNep", id: "benefits", href: "#benefits" },
  { label: "Reviews", id: "testimonials", href: "#testimonials" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["hero", "categories", "products", "features", "benefits", "testimonials"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-500 ${
        scrolled
          ? "bg-[#050816]/90 backdrop-blur-md border-b border-white/[0.05]"
          : "bg-transparent"
      }`}
    >
      <div className="container-max h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="CargoNep home" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-transparent border border-[#00E5FF]/30 group-hover:border-[#00E5FF]/60 transition-colors">
            <svg
              className="w-5 h-5 text-[#00E5FF] animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-white">Cargo</span>
            <span className="text-[#00E5FF]">Nep</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center flex-1 mx-10">
          <ul className="flex items-center gap-10">
            {navItems.map((item) => (
              <li key={item.label} className="relative">
                <a
                  href={item.href}
                  className={`relative text-sm font-semibold tracking-wide transition-all duration-300 py-5 ${
                    activeSection === item.id
                      ? "text-[#00E5FF]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#00E5FF] rounded-full shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Get Started Button */}
          <Link
            href="/login"
            className="btn-primary btn-sm hidden sm:inline-flex"
          >
            Get Started
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-white/[0.03]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden bg-[#050816]/95 backdrop-blur-xl border-b border-white/[0.05]">
          <div className="container-max py-8">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-5 py-4 text-sm font-semibold transition-colors rounded-xl ${
                    activeSection === item.id
                      ? "bg-[#00E5FF]/10 text-[#00E5FF]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="pt-6 mt-6 border-t border-white/[0.05] flex flex-col gap-4">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-5 py-3 rounded-xl text-sm font-bold bg-[#00E5FF] text-[#050816] hover:bg-[#00F0FF] no-underline block"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
