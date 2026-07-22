import {
  CheckCircle2,
  Eye,
  Handshake,
  Lightbulb,
  MapPin,
  MapPinned,
  Radar,
  Send,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import Card from "@/components/ui/Card";

const overviewParagraphs = [
  "For too long, logistics in Nepal remained fragmented and opaque. Unclear delivery statuses, unpredictable delays, and the difficulty of reaching remote regions hindered business growth and personal connections.",
  "CargoNep was founded to bridge this gap. We recognized that the unique geography of Nepal required more than just trucks - it required a smart network built on trust and real-time intelligence.",
  "From the busy streets of Kathmandu to the winding trails of remote hill stations, we ensure your shipments move smoothly across the map.",
];

const coreValues = [
  {
    title: "Reliability",
    text: "A promise made is a delivery kept. We value your time.",
    icon: Handshake,
  },
  {
    title: "Transparency",
    text: "Honest communication through every stage of shipment.",
    icon: Radar,
  },
  {
    title: "Customer Focus",
    text: "Building solutions centered around user convenience.",
    icon: Users,
  },
  {
    title: "Safety",
    text: "Uncompromising security for every package we handle.",
    icon: Shield,
  },
  {
    title: "Innovation",
    text: "Constantly evolving to stay ahead of logistics trends.",
    icon: Lightbulb,
  },
  {
    title: "Local Understanding",
    text: "Deep roots and respect for Nepalese communities.",
    icon: MapPin,
  },
];

const technologyHighlights = [
  "Integrated GPS Monitoring",
  "Automated Status Notifications",
  "AI-powered Route Optimization",
];

const whyChooseFeatures = [
  {
    title: "Flexible Payment Method",
    text: "COD and payment visibility help customers and teams handle delivery charges with confidence.",
    icon: Wallet,
  },
  {
    title: "Real-time Tracking System",
    text: "Live shipment updates keep admins, customers, and drivers aligned from pickup to delivery.",
    icon: Radar,
  },
  {
    title: "Designed for Nepal",
    text: "Built around local routes, districts, terrain, COD habits, and last-mile delivery realities.",
    icon: MapPinned,
  },
  {
    title: "Reliable Driver Network",
    text: "Driver assignment and delivery updates support dependable movement across daily operations.",
    icon: Users,
  },
];

const whyChooseUs = [
  "Flexible payment methods make COD and delivery charges easier to manage.",
  "Real-time tracking reduces uncertainty from booking to doorstep.",
  "Designed for Nepal routes, districts, terrain, and last-mile delivery realities.",
  "A reliable driver network helps teams keep deliveries moving with accountability.",
];

function OverviewVisual() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-tr from-[var(--accent-soft)] via-transparent to-[rgba(121,83,18,0.06)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-sm)]">
        <img
          src="/story.png"
          alt="CargoNep team reviewing logistics operations together in a warehouse"
          className="aspect-[16/11] w-full rounded-[1rem] object-cover"
        />
      </div>
    </div>
  );
}

function TechnologyPreview() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-[rgba(121,83,18,0.08)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_20px_45px_rgba(45,45,45,0.14)]">
        <img
          src="/tech.png"
          alt="Logistics technology in action — a warehouse management dashboard on a tablet"
          className="aspect-[16/10] w-full rounded-[1rem] object-cover"
        />
      </div>
    </div>
  );
}
export default function AboutContent() {
  return (
    <>
      <section className="relative overflow-hidden pb-14 pt-28 sm:pb-16 sm:pt-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,rgba(200,162,74,0.10)_0%,transparent_62%)]" />

        <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(460px,0.8fr)] lg:gap-12 xl:gap-16">
            <div className="mx-auto max-w-[780px] lg:mx-0">
              <div className="section-tag">
                <span className="section-tag-dot" />Our Story
              </div>
              <h2 className="heading-md mt-1">Built to solve Nepal&apos;s delivery challenges.</h2>
              <div className="mt-5 space-y-4">
                {overviewParagraphs.map((paragraph) => (
                  <p key={paragraph} className="body-text">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[580px] lg:ml-auto">
              <OverviewVisual />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-14 sm:pb-16">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            <Card padding="p-7 sm:p-8" hover glow>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(121,83,18,0.2)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[var(--accent-strong)]">Our Mission</h3>
                  <p className="mt-2 body-text-sm">
                    To empower Nepalese businesses and individuals by providing a seamless, transparent, and reliable
                    logistics infrastructure that connects every corner of the nation through technology.
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="p-7 sm:p-8" hover glow>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(121,83,18,0.2)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[var(--accent-strong)]">Our Vision</h3>
                  <p className="mt-2 body-text-sm">
                    To become the backbone of Nepal&apos;s digital economy, setting the gold standard for logistics
                    excellence and technological integration in South Asia&apos;s unique mountain terrains.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="pb-14 sm:pb-16">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-extrabold text-[var(--accent-strong)] sm:text-3xl">Our Core Values</h2>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {coreValues.map(({ icon: Icon, title, text }) => (
              <Card key={title} padding="p-6" hover glow className="h-full">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(121,83,18,0.18)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <Icon size={19} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--text)]">{title}</h3>
                    <p className="mt-1.5 body-text-sm">{text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="relative border-y border-[var(--border)] bg-[rgba(255,255,255,0.32)] py-14 sm:py-16">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.8fr)] lg:px-8 xl:gap-16">
          <TechnologyPreview />

          <div>
            <h2 className="text-3xl font-extrabold leading-tight text-[var(--accent-strong)] sm:text-4xl">
              Advanced Logistics Technology
            </h2>
            <p className="mt-5 body-text">
              Our proprietary technology stack handles complex routing algorithms to minimize fuel consumption and
              maximize delivery speed.
            </p>
            <div className="mt-7 space-y-4">
              {technologyHighlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="shrink-0 text-[var(--success)]" />
                  <p className="text-base font-semibold text-[var(--text-soft)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-16">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.82fr)] lg:gap-14">
            <div>
              <div className="section-tag">
                <span className="section-tag-dot" />Why Choose Us
              </div>
              <h2 className="heading-lg mt-1">A practical solution for Nepal logistics.</h2>
              <p className="mt-5 body-text">
                The system is shaped around real operational needs: reliable assignment, visible delivery progress,
                COD accountability, and a simple experience for everyone involved.
              </p>
              <div className="mt-7 space-y-4">
                {whyChooseUs.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[var(--success)]" />
                    <p className="body-text-sm text-[var(--text-soft)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {whyChooseFeatures.map(({ icon: Icon, title, text }) => (
                <Card key={title} padding="p-6" hover glow className="h-full">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(121,83,18,0.18)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <Icon size={21} />
                  </div>
                  <h3 className="heading-sm">{title}</h3>
                  <p className="mt-2 body-text-sm">{text}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
