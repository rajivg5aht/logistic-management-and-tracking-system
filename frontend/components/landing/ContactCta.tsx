"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ContactCta() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[var(--app-bg)] pt-20 pb-0">
      <div className="w-full">
        <div className="container-max">
          <div className="dark-panel relative text-center overflow-hidden px-8 py-14 md:px-16 md:py-18 lg:px-24 lg:py-24">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(200,162,74,0.06)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute top-0 left-20 right-20 h-px bg-gradient-to-r from-transparent via-[rgba(200,162,74,0.15)] to-transparent" />

            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-normal text-[var(--text-on-dark)]">
                Ready to Optimize Your Fleet?
              </h2>
              <p className="mt-4 text-base leading-7 text-[var(--text-on-dark-muted)]">
                Schedule a personalized demo with our logistics experts and see how CargoNep can transform your operations in as little as 30 days.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <Link href="/login" className="btn-primary-lg">
                  Get Started Now <ArrowRight size={18} className="ml-1.5" />
                </Link>
                <a href="#" className="btn-secondary-lg">Contact Sales</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-20" />
    </section>
  );
}
