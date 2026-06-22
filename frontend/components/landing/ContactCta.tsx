"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ContactCta() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#050816] pt-20 pb-0">
      <div className="w-full">
        <div className="container-max">
          <div className="relative bg-gradient-to-br from-[#0B1220] via-[#0B1220] to-[#050816] border border-[#00E5FF]/10 text-center overflow-hidden rounded-[28px] lg:rounded-[36px] px-12 py-16 md:px-20 md:py-20 lg:px-24 lg:py-24">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute top-0 left-20 right-20 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/15 to-transparent" />

            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-[clamp(36px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-white">
                Ready to Optimize Your Fleet?
              </h2>
              <p className="mt-4 body-text">
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