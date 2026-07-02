import Link from "next/link";
import { Package, Radar, Wallet, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";

const solutions = [
  {
    icon: <Package size={22} />,
    title: "Book a Shipment",
    desc: "Schedule guaranteed pickups from your doorstep in just a few clicks. Transparent pricing with no hidden fees, every single time.",
    action: "Explore Booking",
    href: "/login",
  },
  {
    icon: <Radar size={22} />,
    title: "Track in Real Time",
    desc: "High-precision GPS tracking for every parcel. Get instant updates on route changes and accurate estimated arrival times.",
    action: "Live Dashboard",
    href: "/tracking",
  },
  {
    icon: <Wallet size={22} />,
    title: "Cash on Delivery",
    desc: "A reliable COD engine built for Nepali commerce. Fast settlement and complete financial transparency for your business growth.",
    action: "Partner With Us",
    href: "/register",
  },
];

export default function CoreSolutions() {
  return (
    <section id="solutions" className="section relative">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <div className="section-tag"><span className="section-tag-dot" />Core Solutions</div>
          <h2 className="heading-lg">Our Core Solutions</h2>
          <p className="mt-4 body-text">
            Simplifying the complexities of transport and trade across Nepal with clean, technology-driven logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {solutions.map((sol) => (
            <Card key={sol.title} padding="p-7 sm:p-8" hover glow className="flex flex-col">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(200,162,74,0.20)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_15px_rgba(200,162,74,0.08)]">
                {sol.icon}
              </div>
              <h3 className="heading-sm mb-2 transition-colors group-hover:text-[var(--accent)]">{sol.title}</h3>
              <p className="body-text-sm mb-6 flex-1">{sol.desc}</p>
              <Link
                href={sol.href}
                className="group/btn inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
              >
                {sol.action}
                <ArrowRight size={15} className="transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
