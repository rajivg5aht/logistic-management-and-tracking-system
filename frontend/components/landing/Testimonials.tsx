"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";

const testimonials = [
  {
    rating: 5,
    quote: "CargoNep completely revolutionized how we handle our trans-pacific shipments. The AI route planning alone saved us millions in the first quarter.",
    name: "Marcus Chen",
    role: "Director of Logistics",
    company: "GlobalPort",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    initials: "MC",
  },
  {
    rating: 5,
    quote: "The visibility we have now is unprecedented. Every driver, every container, every mile—it's all there in one beautiful dashboard.",
    name: "Sarah Jenkins",
    role: "COO",
    company: "RapidState Fleet",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
    initials: "SJ",
  },
  {
    rating: 5,
    quote: "The switch to CargoNep was the single best decision for our fleet operations this decade. Implementation was seamless and the ROI was immediate.",
    name: "David Thorne",
    role: "SVP Operations",
    company: "NexuSteer Trans",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
    initials: "DT",
  },
  {
    rating: 5,
    quote: "We reduced our delivery times by 40% in just two months. CargoNep's routing algorithms are light-years ahead of anything else we tried.",
    name: "Emily Rodriguez",
    role: "VP Supply Chain",
    company: "OmniLogistics",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
    initials: "ER",
  },
  {
    rating: 5,
    quote: "The predictive analytics saved us from a major supply chain disruption. We saw the bottleneck warning three weeks before it would have hit.",
    name: "James Whitfield",
    role: "CTO",
    company: "CargoSync Inc.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    initials: "JW",
  },
  {
    rating: 5,
    quote: "Implementation was incredibly smooth. Our team was fully operational on CargoNep within a week, and the support team was phenomenal throughout.",
    name: "Lisa Park",
    role: "Operations Director",
    company: "TransPac Shipping",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face",
    initials: "LP",
  },
];

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <Card padding="p-8 lg:p-10" hover={true} glow={true} className="flex flex-col h-full min-w-[320px]">
      <div className="flex gap-1 mb-6">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} size={16} className="text-[#00E5FF] fill-[#00E5FF]" />
        ))}
      </div>
      <p className="body-text italic mb-8 text-white/70 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3.5 pt-6 border-t border-white/[0.04] mt-auto">
        <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full border border-[#00E5FF]/20 object-cover flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-white tracking-tight">{t.name}</p>
          <p className="text-xs text-white/40 mt-0.5">{t.role}, {t.company}</p>
        </div>
      </div>
    </Card>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardsPerSlide, setCardsPerSlide] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1200) setCardsPerSlide(3);
      else if (w >= 768) setCardsPerSlide(2);
      else setCardsPerSlide(1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const slides = chunkArray(testimonials, cardsPerSlide);
  const totalSlides = slides.length;

  const goTo = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(index, totalSlides - 1)));
  }, [totalSlides]);

  const next = useCallback(() => {
    setCurrent((c) => (c >= totalSlides - 1 ? 0 : c + 1));
  }, [totalSlides]);

  const prev = useCallback(() => {
    setCurrent((c) => (c <= 0 ? totalSlides - 1 : c - 1));
  }, [totalSlides]);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrent((c) => (c >= totalSlides - 1 ? 0 : c + 1));
      }, 5500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, totalSlides]);

  return (
    <Section id="testimonials" className="scroll-mt-20 bg-[#050816]">
      <div className="glow-orb glow-orb-lg" style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="heading-lg">Trusted by Industry Leaders</h2>
          <p className="mt-3 body-text">Join the 500+ global enterprises optimizing with CargoNep.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={prev} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/25 hover:bg-white/[0.02] transition-all cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/25 hover:bg-white/[0.02] transition-all cursor-pointer">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(-${current * 100}%)`,
            transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {slides.map((group, slideIdx) => (
            <div key={slideIdx} className="min-w-full flex gap-6">
              {group.map((t) => (
                <div key={t.name} className="flex-1 min-w-0">
                  <TestimonialCard t={t} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-[#00E5FF] w-6" : "bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}