import Image from "next/image";
import { Boxes, Cpu, Factory, HardHat, PackageCheck, Pill } from "lucide-react";
import Card from "@/components/ui/Card";

const industries = [
  {
    title: "Manufacturing & Industry",
    description: "Reliable movement of parts, equipment, and production materials across Nepal.",
    image: "/image.png",
    alt: "Cargo transport moving across Nepal",
    icon: Factory,
  },
  {
    title: "Retail & eCommerce",
    description: "Flexible last-mile fulfilment that keeps stores and online orders moving.",
    image: "/story.png",
    alt: "Packed parcels ready for delivery",
    icon: PackageCheck,
  },
  {
    title: "Technology",
    description: "Careful delivery for devices, components, and high-value equipment.",
    image: "/tech.png",
    alt: "Electronic components on a circuit board",
    icon: Cpu,
  },
  {
    title: "Construction & Projects",
    description: "Coordinated transport for materials and time-sensitive project supplies.",
    image: "/himal.jpg",
    alt: "Nepal's mountain terrain along a logistics route",
    icon: HardHat,
  },
  {
    title: "Healthcare",
    description: "Dependable handling for medical supplies and essential healthcare deliveries.",
    image: "/hi.jpg",
    alt: "Professional logistics service for essential deliveries",
    icon: Pill,
  },
  {
    title: "General Cargo",
    description: "Practical freight support for commercial goods of every size and shape.",
    image: "/cargo_ship_neon.png",
    alt: "Cargo vessel representing freight transport",
    icon: Boxes,
  },
];

export default function Industries() {
  return (
    <section id="industries" className="relative overflow-hidden pb-16 sm:pb-20 lg:pb-24">
      <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(233,196,106,0.11)_0%,transparent_68%)]" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="section-header mb-10 sm:mb-12">
          <div className="section-tag">
            <span className="section-tag-dot" />Built for your cargo
          </div>
          <h2 className="heading-lg">Industries We Keep Moving</h2>
          <p className="mt-4 body-text">
            From everyday deliveries to specialised freight, CargoNep adapts to the demands of your business.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {industries.map((industry) => {
            const Icon = industry.icon;

            return (
              <Card
                key={industry.title}
                padding="p-0"
                glow
                className="h-full overflow-hidden border-[var(--border-light)]"
              >
                <div className="relative h-40 overflow-hidden bg-[var(--surface-muted)] sm:h-44">
                  <Image
                    src={industry.image}
                    alt={industry.alt}
                    fill
                    sizes="(min-width: 1280px) 31vw, (min-width: 768px) 46vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(25,24,23,0.22)] to-transparent" />
                </div>

                <div className="flex min-h-44 flex-col p-5 sm:p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <Icon size={19} aria-hidden="true" />
                  </div>
                  <h3 className="heading-sm">{industry.title}</h3>
                  <p className="mt-2 body-text-sm">{industry.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
