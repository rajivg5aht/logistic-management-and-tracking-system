import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Benefits from "@/components/landing/Benefits";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import ContactCta from "@/components/landing/ContactCta";
import Footer from "@/components/landing/Footer";
import Card from "@/components/ui/Card";
import Section from "@/components/layout/Section";
import { Cpu, Layers, Tag, HardDrive, Star, ArrowRight, ShoppingBag } from "lucide-react";

function FeaturedCategories() {
  const categories = [
    {
      icon: <Cpu size={22} className="text-[var(--accent)]" />,
      title: "IoT Fleet Sensors",
      desc: "Real-time GPS, environment, and tilt tracking hardware.",
      action: "Shop Hardware",
      link: "#products",
    },
    {
      icon: <Layers size={22} className="text-[var(--accent)]" />,
      title: "SaaS Licenses",
      desc: "Enterprise vehicle dashboard and route planner APIs.",
      action: "Explore Plans",
      link: "#products",
    },
    {
      icon: <Tag size={22} className="text-[var(--accent)]" />,
      title: "Consumables & Labels",
      desc: "Heavy-duty RFID tags and barcode shipment prints.",
      action: "Order Supplies",
      link: "#products",
    },
    {
      icon: <HardDrive size={22} className="text-[var(--accent)]" />,
      title: "Warehouse Hardware",
      desc: "Wireless scanner guns, gateways, and local print hubs.",
      action: "View Terminals",
      link: "#products",
    },
  ];

  return (
    <Section id="categories" className="bg-[var(--app-bg)]">
      <div className="section-header">
        <div className="section-tag"><span className="section-tag-dot" />Core Logistics Categories</div>
        <h2 className="heading-lg">Explore Core Categories</h2>
        <p className="mt-4 body-text">Procure industrial grade IoT tracking hardware and software automation tools tailored for your supply chain requirements.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <Card key={idx} padding="p-6 sm:p-8" className="flex min-w-0 flex-col justify-between" hover={true} glow={true}>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-6 border border-[rgba(200,162,74,0.20)] shadow-[0_0_15px_rgba(200,162,74,0.08)]">
                {cat.icon}
              </div>
              <h3 className="heading-sm mb-2 group-hover:text-[var(--accent)] transition-colors">{cat.title}</h3>
              <p className="body-text-sm mb-6">{cat.desc}</p>
            </div>
            <a href={cat.link} className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:text-[var(--text)] transition-colors group/btn">
              {cat.action} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function PopularProducts() {
  const products = [
    {
      title: "CargoNep Beacon GPS V2",
      type: "IoT Hardware",
      desc: "Sub-meter accuracy container beacon with a 5-year active battery life.",
      price: "$49.00",
      rating: 5,
      svg: (
        <svg viewBox="0 0 200 120" className="w-full h-full text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="50" y="30" width="100" height="60" rx="10" stroke="rgba(255,247,232,0.12)" fill="var(--surface-dark)" />
          <circle cx="100" cy="60" r="16" stroke="rgba(200,162,74,0.2)" strokeWidth="1" fill="var(--app-bg)" />
          <circle cx="100" cy="60" r="6" fill="var(--accent)" className="animate-pulse" />
          <line x1="100" y1="44" x2="100" y2="15" strokeDasharray="3 3" />
          <circle cx="100" cy="15" r="3" fill="var(--text-on-dark)" />
        </svg>
      ),
    },
    {
      title: "CargoNep Router API License",
      type: "SaaS Software",
      desc: "Neural network API key for global route planner calculations in milliseconds.",
      price: "$29.00/mo",
      rating: 5,
      svg: (
        <svg viewBox="0 0 200 120" className="w-full h-full text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="60" cy="60" r="8" fill="var(--surface-dark)" stroke="rgba(255,247,232,0.12)" />
          <circle cx="140" cy="60" r="8" fill="var(--surface-dark)" stroke="rgba(255,247,232,0.12)" />
          <circle cx="100" cy="35" r="8" fill="var(--surface-dark)" stroke="rgba(255,247,232,0.12)" />
          <circle cx="100" cy="85" r="8" fill="var(--app-bg)" stroke="var(--accent)" />
          <path d="M68 60 h64 M100 43 v34" stroke="rgba(200,162,74,0.3)" />
          <path d="M100 35 L60 60 L100 85 L140 60 Z" stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      ),
    },
    {
      title: "RFID Cargo Tags (50-Pack)",
      type: "Consumables",
      desc: "Tamper-proof smart tags for container tracking and security logs.",
      price: "$15.00",
      rating: 5,
      svg: (
        <svg viewBox="0 0 200 120" className="w-full h-full text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="60" y="35" width="80" height="50" rx="5" stroke="rgba(255,247,232,0.12)" fill="var(--surface-dark)" />
          <path d="M70 45 h40 M70 55 h60 M70 65 h30" stroke="rgba(255,247,232,0.24)" strokeWidth="2" strokeLinecap="round" />
          <rect x="110" y="65" width="20" height="12" rx="2" stroke="var(--accent)" fill="var(--app-bg)" />
          <circle cx="120" cy="71" r="2" fill="var(--accent)" />
        </svg>
      ),
    },
    {
      title: "Warehouse Scanner Hub",
      type: "Hardware Terminal",
      desc: "Industrial transceiver gateway coordinating all local RFID scanner units.",
      price: "$199.00",
      rating: 5,
      svg: (
        <svg viewBox="0 0 200 120" className="w-full h-full text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="70" y="25" width="60" height="70" rx="6" stroke="rgba(255,247,232,0.12)" fill="var(--surface-dark)" />
          <rect x="78" y="33" width="44" height="30" rx="2" stroke="rgba(200,162,74,0.3)" fill="var(--app-bg)" />
          <rect x="88" y="70" width="24" height="6" rx="1" fill="var(--accent)" />
          <circle cx="88" cy="84" r="3" fill="rgba(255,247,232,0.34)" />
          <circle cx="100" cy="84" r="3" fill="rgba(255,247,232,0.34)" />
          <circle cx="112" cy="84" r="3" fill="rgba(255,247,232,0.34)" />
        </svg>
      ),
    },
  ];

  return (
    <Section id="products" className="bg-[var(--app-bg)]">
      <div className="section-header">
        <div className="section-tag"><span className="section-tag-dot" />Top-Selling Solutions</div>
        <h2 className="heading-lg">Popular Hardware & SaaS</h2>
        <p className="mt-4 body-text">Premium products selected by industry leaders to unlock complete visibility and cut operational overhead.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((prod, idx) => (
          <Card key={idx} padding="p-6 sm:p-8" className="flex min-w-0 flex-col justify-between" hover={true} glow={true}>
            <div className="bg-[rgba(246,241,231,0.75)] border border-[var(--border)] rounded-xl overflow-hidden aspect-[1.5] mb-5 flex items-center justify-center relative group-hover:border-[rgba(200,162,74,0.10)] transition-colors">
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[rgba(35,33,29,0.84)] border border-[var(--border-dark)] text-[10px] font-bold tracking-wider text-[var(--text-on-dark-muted)] uppercase">{prod.type}</div>
              <div className="w-full h-full p-2 group-hover:scale-105 transition-transform duration-500">{prod.svg}</div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: prod.rating }).map((_, sIdx) => (
                    <Star key={sIdx} size={12} className="text-[var(--accent)] fill-[var(--accent)]" />
                  ))}
                </div>
                <h3 className="heading-sm mb-2 group-hover:text-[var(--accent)] transition-colors">{prod.title}</h3>
                <p className="body-text-sm mb-6">{prod.desc}</p>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between mt-auto">
                <span className="text-lg font-bold text-[var(--text)] tracking-tight">{prod.price}</span>
                <button className="btn-primary btn-sm flex items-center gap-1.5"><ShoppingBag size={12} />Buy Now</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export default function Home() {
  return (
    <div className="bg-[var(--app-bg)] min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <FeaturedCategories />
        <PopularProducts />
        <Features />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <ContactCta />
      </main>
      <Footer />
    </div>
  );
}
