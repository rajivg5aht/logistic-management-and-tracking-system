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
      <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-tr from-[var(--accent-soft)] via-transparent to-[rgba(29,122,140,0.06)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-sm)]">
        <div className="relative aspect-[16/11] overflow-hidden rounded-[1rem]">
          <svg viewBox="0 0 560 420" className="h-full w-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="hubWall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FBF2DE" />
                <stop offset="100%" stopColor="#F4EBD6" />
              </linearGradient>
            </defs>
            <rect width="560" height="420" fill="url(#hubWall)" />
            <rect x="0" y="330" width="560" height="90" fill="rgba(58,46,18,0.06)" />
            {[70, 300].map((sx) => (
              <g key={sx}>
                <rect x={sx} y="90" width="190" height="230" rx="10" fill="rgba(255,255,255,0.6)" stroke="rgba(200,162,74,0.3)" strokeWidth="2" />
                {[150, 230].map((ry) => (
                  <line key={ry} x1={sx} y1={ry} x2={sx + 190} y2={ry} stroke="rgba(200,162,74,0.28)" strokeWidth="2" />
                ))}
                {[
                  { x: sx + 16, y: 104, w: 46, h: 38 },
                  { x: sx + 74, y: 110, w: 40, h: 32 },
                  { x: sx + 126, y: 100, w: 48, h: 42 },
                  { x: sx + 20, y: 176, w: 52, h: 46 },
                  { x: sx + 90, y: 182, w: 44, h: 40 },
                  { x: sx + 24, y: 258, w: 40, h: 44 },
                  { x: sx + 78, y: 252, w: 56, h: 50 },
                ].map((b, i) => (
                  <g key={i}>
                    <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="4" fill={i % 2 === 0 ? "#E9C46A" : "#C99A3D"} opacity="0.9" />
                    <line x1={b.x} y1={b.y + b.h / 2} x2={b.x + b.w} y2={b.y + b.h / 2} stroke="rgba(58,46,18,0.25)" strokeWidth="2" />
                  </g>
                ))}
              </g>
            ))}
            <g transform="translate(360,250)">
              <rect x="0" y="18" width="96" height="52" rx="8" fill="var(--teal)" />
              <rect x="96" y="34" width="46" height="36" rx="8" fill="#17636F" />
              <rect x="104" y="42" width="30" height="18" rx="3" fill="rgba(255,255,255,0.55)" />
              <circle cx="28" cy="76" r="13" fill="#2D2D2D" />
              <circle cx="28" cy="76" r="5" fill="#9B9B9B" />
              <circle cx="118" cy="76" r="13" fill="#2D2D2D" />
              <circle cx="118" cy="76" r="5" fill="#9B9B9B" />
            </g>
          </svg>

          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.92)] px-3 py-2 text-xs shadow-[var(--shadow-sm)] backdrop-blur">
            <span className="font-bold tracking-tight">
              <span className="text-[var(--text)]">Cargo</span>
              <span className="text-[var(--accent-hover)]">Nep</span>
            </span>
            <span className="text-[var(--text-muted)]">- Hub Operations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnologyPreview() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-3 rounded-[1.5rem] bg-[rgba(29,122,140,0.08)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.35rem] border-[10px] border-[var(--text)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(45,45,45,0.18)]">
        <div className="flex h-7 items-center border-b border-[var(--border)] bg-[var(--surface)] px-3 text-[8px] font-semibold text-[var(--text-muted)]">
          <span className="font-bold text-[var(--teal)]">CargoNep</span>
          <span className="mx-auto text-[var(--text)]">About Us - CargoNep</span>
          <span>Live Tracking</span>
        </div>

        <div className="grid aspect-[16/9] grid-cols-[0.9fr_1.1fr] gap-3 bg-[#F7FAFC] p-4">
          <div className="space-y-3">
            <div className="rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-sm">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[var(--text-muted)]">Our Story</p>
              <p className="mt-2 text-[11px] font-extrabold leading-tight text-[var(--text)]">CargoNep Connecting Nepal.</p>
              <div className="mt-2 space-y-1.5">
                <span className="block h-1.5 w-full rounded bg-[#DCE6EF]" />
                <span className="block h-1.5 w-5/6 rounded bg-[#DCE6EF]" />
                <span className="block h-1.5 w-2/3 rounded bg-[#DCE6EF]" />
              </div>
              <div className="mt-3 h-14 rounded-md bg-[linear-gradient(135deg,#E5F1F3,#FBF1DC)]" />
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-sm">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[var(--text-muted)]">Our Network</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                {["75+", "80%", "200+"].map((item) => (
                  <div key={item}>
                    <p className="text-sm font-extrabold text-[var(--text)]">{item}</p>
                    <span className="block h-1 rounded bg-[#DCE6EF]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[var(--text-muted)]">Shipment Tracker</p>
                <span className="rounded bg-[#2B7BBB] px-2 py-1 text-[8px] font-bold text-white">Live map</span>
              </div>
              <div className="relative mt-3 h-28 overflow-hidden rounded-md bg-[#DCEFEF]">
                <svg viewBox="0 0 280 120" className="h-full w-full" aria-hidden="true">
                  <path d="M10 92 C 70 70, 95 40, 145 55 S 220 50, 270 20" fill="none" stroke="#2B7BBB" strokeWidth="3" strokeLinecap="round" />
                  {[28, 88, 148, 205, 252].map((cx, index) => (
                    <g key={cx}>
                      <circle cx={cx} cy={[86, 58, 55, 43, 27][index]} r="7" fill="#2B7BBB" opacity="0.18" />
                      <circle cx={cx} cy={[86, 58, 55, 43, 27][index]} r="3" fill="#2B7BBB" />
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                "ETA Prediction",
                "Route Intelligence",
                "Proof Updates",
                "Delivery Queue",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-sm">
                  <p className="text-[9px] font-bold text-[var(--text)]">{item}</p>
                  <span className="mt-2 block h-1.5 w-2/3 rounded bg-[#DCE6EF]" />
                </div>
              ))}
            </div>
          </div>
        </div>
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
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(29,122,140,0.2)] bg-[var(--teal-tint)] text-[var(--teal)]">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[var(--teal)]">Our Mission</h3>
                  <p className="mt-2 body-text-sm">
                    To empower Nepalese businesses and individuals by providing a seamless, transparent, and reliable
                    logistics infrastructure that connects every corner of the nation through technology.
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="p-7 sm:p-8" hover glow>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(29,122,140,0.2)] bg-[var(--teal-tint)] text-[var(--teal)]">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[var(--teal)]">Our Vision</h3>
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
          <h2 className="text-center text-2xl font-extrabold text-[var(--teal)] sm:text-3xl">Our Core Values</h2>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {coreValues.map(({ icon: Icon, title, text }) => (
              <Card key={title} padding="p-6" hover glow className="h-full">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(29,122,140,0.18)] bg-[var(--teal-tint)] text-[var(--teal)]">
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
            <h2 className="text-3xl font-extrabold leading-tight text-[var(--teal)] sm:text-4xl">
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
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(29,122,140,0.18)] bg-[var(--teal-tint)] text-[var(--teal)]">
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
