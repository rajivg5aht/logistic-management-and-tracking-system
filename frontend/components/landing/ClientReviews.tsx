"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import Card from "@/components/ui/Card";

const reviews = [
  {
    quote:
      "CargoNep gives our team the visibility we need to plan deliveries with confidence. Every update is clear and arrives when it matters.",
    name: "Maya Shrestha",
    role: "Operations Manager",
    company: "Everest Retail House",
    initials: "MS",
  },
  {
    quote:
      "The pickup process is dependable and the tracking updates make it simple to keep our customers informed from dispatch to delivery.",
    name: "Rohan Karki",
    role: "Supply Chain Lead",
    company: "Himalayan Essentials",
    initials: "RK",
  },
  {
    quote:
      "Their team understands that our shipments need careful handling. The service feels reliable, responsive, and built for growing businesses.",
    name: "Sita Rai",
    role: "Commercial Director",
    company: "Nepal Tech Works",
    initials: "SR",
  },
  {
    quote:
      "Coordinating deliveries across districts used to take constant follow-ups. CargoNep gives us one dependable place to manage the flow.",
    name: "Arjun Thapa",
    role: "Distribution Manager",
    company: "Valley Foods",
    initials: "AT",
  },
  {
    quote:
      "The delivery experience has become much more predictable for our stores, especially during our busiest periods.",
    name: "Nisha Gurung",
    role: "Retail Operations Lead",
    company: "Summit Mart",
    initials: "NG",
  },
];

export default function ClientReviews() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reviewRefs = useRef<Array<HTMLDivElement | null>>([]);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const selectReview = (index: number) => {
    setActiveIndex((index + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    const carousel = carouselRef.current;
    const review = reviewRefs.current[activeIndex];
    if (!carousel || !review) return;

    carousel.scrollTo?.({
      left: review.offsetLeft - carousel.offsetLeft,
      behavior: "smooth",
    });
  }, [activeIndex]);

  return (
    <section id="reviews" className="section relative overflow-hidden pb-20 sm:pb-24">
      <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(233,196,106,0.10)_0%,transparent_70%)]" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="section-header mb-10 sm:mb-12">
          <div className="section-tag">
            <span className="section-tag-dot" />Partner experiences
          </div>
          <h2 className="heading-lg">What Our Clients Say</h2>
          <p className="mt-4 body-text">
            Trusted by businesses across Nepal for dependable logistics and clear, timely delivery updates.
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-x-12 top-1/2 h-48 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(233,196,106,0.08)_0%,transparent_70%)] blur-2xl" />
          <div
            ref={carouselRef}
            aria-label="Client reviews"
            aria-roledescription="carousel"
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            {reviews.map((review, index) => (
              <div
                key={review.name}
                ref={(element) => {
                  reviewRefs.current[index] = element;
                }}
                className="carousel-card snap-start"
              >
                <Card padding="p-6 sm:p-7" className="flex min-h-[22rem] h-full flex-col">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                      <Quote size={19} aria-hidden="true" />
                    </div>
                    <div className="flex gap-1" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }, (_, star) => (
                        <Star key={star} size={16} fill="currentColor" className="text-[var(--accent-hover)]" aria-hidden="true" />
                      ))}
                    </div>
                  </div>

                  <blockquote className="mt-6 flex-1 text-[1rem] font-medium leading-7 text-[var(--text-soft)]">
                    {review.quote}
                  </blockquote>

                  <div className="mt-7 flex items-center gap-3 border-t border-[var(--border)] pt-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-sm font-extrabold text-[var(--accent-strong)]">
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[var(--text)]">{review.name}</p>
                      <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">
                        {review.role} at {review.company}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => selectReview(activeIndex - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-soft)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] hover:text-[var(--accent-strong)]"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2" aria-label="Review slide selector">
              {reviews.map((review, index) => (
                <button
                  key={review.name}
                  type="button"
                  aria-label={`Go to review ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  onClick={() => selectReview(index)}
                  className={`h-2 rounded-full transition-all ${activeIndex === index ? "w-7 bg-[var(--accent)]" : "w-2 bg-[var(--border-strong)] hover:bg-[var(--accent-hover)]"}`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => selectReview(activeIndex + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-soft)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] hover:text-[var(--accent-strong)]"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
