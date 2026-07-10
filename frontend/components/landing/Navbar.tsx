"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";

const navItems = [
  { label: "Home", id: "hero", href: "/#hero" },
  { label: "Solutions", id: "solutions", href: "/#solutions" },
  { label: "Network", id: "network", href: "/#network" },
  { label: "About Us", id: "about", href: "/about" },
  { label: "Contact", id: "contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const activeId =
    pathname === "/about"
      ? "about"
      : pathname === "/contact"
        ? "contact"
        : activeSection;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["hero", "solutions", "network"];
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
          ? "bg-[rgba(248,245,239,0.90)] backdrop-blur-md border-b border-[var(--border)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" aria-label="CargoNep home" className="group flex shrink-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-[var(--text)]">Cargo</span>
            <span className="text-[var(--accent)]">Nep</span>
          </span>
        </Link>

        <nav className="mx-10 hidden flex-1 items-center justify-center md:flex">
          <ul className="flex items-center gap-6 lg:gap-9">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`group/nav relative flex flex-col items-center gap-1.5 py-5 text-sm font-semibold tracking-wide transition-colors duration-300 ${
                    activeId === item.id
                      ? "text-[var(--accent-hover)]"
                      : "text-[var(--text-muted)] hover:text-[var(--accent-hover)]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 bottom-3 h-0.5 origin-left rounded-full bg-[var(--accent)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
                      activeId === item.id
                        ? "scale-x-100"
                        : "scale-x-0 group-hover/nav:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button suppressHydrationWarning
            type="button"
            aria-label="Search"
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] sm:flex"
          >
            <Search size={18} />
          </button>
          <Link href="/login" className="btn-secondary btn-sm hidden sm:inline-flex">
            Login
          </Link>
          <Link href="/register" className="btn-primary btn-sm hidden sm:inline-flex">
            Register
          </Link>

          <button suppressHydrationWarning
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="border-b border-[var(--border)] bg-[rgba(248,245,239,0.96)] backdrop-blur-xl md:hidden">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-5 sm:px-6">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-5 py-3.5 text-sm font-semibold transition-colors ${
                    activeId === item.id
                      ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-5">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full">
                Login
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full">
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
