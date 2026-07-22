"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Send, ChevronDown, Loader2 } from "lucide-react";
import { createInquiry } from "@/lib/api/inquiry.api";

const contactInfo = [
  {
    icon: MapPin,
    title: "Office Location",
    lines: [
      { text: "Koteshwor-32, Kathmandu, Nepal" },
      { text: "CargoNep Logistics Center" },
    ],
  },
  {
    icon: Phone,
    title: "Phone Numbers",
    lines: [
      { text: "+977-1-4XXXXXX", href: "tel:+97714000000" },
      { text: "+977-98XXXXXXX (Mobile/Support)", href: "tel:+97798000000" },
    ],
  },
  {
    icon: Mail,
    title: "Email Support",
    lines: [
      { text: "support@cargonep.com.np", href: "mailto:support@cargonep.com.np" },
      { text: "business@cargonep.com.np", href: "mailto:business@cargonep.com.np" },
    ],
  },
];

const socials = [
  { label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" },
];

const faqs = [
  {
    q: "How do I track my shipment?",
    a: "Enter your tracking ID (e.g. CN-84321) in the tracking bar on our homepage, or open the Live Dashboard from your account to see real-time GPS updates and estimated arrival times.",
  },
  {
    q: "What are the delivery charges for outside valley?",
    a: "Charges outside the Kathmandu Valley are calculated by distance, parcel weight, and service level. You will always see transparent pricing with no hidden fees before you confirm a booking.",
  },
  {
    q: "Do you provide home pick-up services?",
    a: "Yes. Schedule a doorstep pickup in a few clicks and our nearest rider collects your parcel at your preferred time slot — available across all 77 districts we cover.",
  },
];

export default function ContactContent() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSent(false);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createInquiry({
        fullName: String(formData.get("fullName") || ""),
        email: String(formData.get("email") || ""),
        subject: String(formData.get("subject") || ""),
        message: String(formData.get("message") || ""),
      });
      form.reset();
      setSent(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to send your message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative pt-28 pb-20 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,162,74,0.05)_0%,transparent_55%)]" />

      <div className="relative mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="mb-10 sm:mb-12">
          <div className="section-tag"><span className="section-tag-dot" />Contact Us</div>
          <h1 className="heading-lg mt-1">Get in Touch</h1>
          <p className="mt-4 max-w-2xl body-text">
            Have questions about your delivery or want to partner with us? Our team is here to help
            you navigate the logistics of Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="card p-6 sm:p-8">
              <div className="space-y-6">
                {contactInfo.map(({ icon: Icon, title, lines }) => (
                  <div key={title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(200,162,74,0.20)] bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--text)]">{title}</p>
                      {lines.map((line) =>
                        "href" in line && line.href ? (
                          <a
                            key={line.text}
                            href={line.href}
                            className="block break-words text-sm leading-relaxed text-[var(--text-muted)] transition-colors hover:text-[var(--accent-hover)]"
                          >
                            {line.text}
                          </a>
                        ) : (
                          <p key={line.text} className="text-sm leading-relaxed text-[var(--text-muted)]">
                            {line.text}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-[var(--border)] pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Connect with us</p>
                <div className="mt-4 flex items-center gap-3">
                  {socials.map(({ label, path }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d={path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="form-wrapper">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input suppressHydrationWarning id="fullName" name="fullName" type="text" required placeholder="Enter your full name" className="form-input" />
                </div>
                <div>
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input suppressHydrationWarning id="email" name="email" type="email" required placeholder="email@example.com" className="form-input" />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="form-label">Subject</label>
                <div className="relative">
                  <select suppressHydrationWarning id="subject" name="subject" defaultValue="Support" className="form-input cursor-pointer">
                    <option>Support</option>
                    <option>Business Partnership</option>
                    <option>Complaint</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="form-label">Message</label>
                <textarea suppressHydrationWarning
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="How can we help you?"
                  className="w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--app-bg-soft)] p-3.5 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-faint)] hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:shadow-[0_0_0_3px_rgba(200,162,74,0.12)]"
                />
              </div>

              {sent && (
                <p className="form-success" role="status">
                  Thanks for reaching out! Our team will get back to you within 24 hours.
                  <span className="mt-1 block text-xs">Use your CargoNep account email to see the response under Dashboard → My Inquiries.</span>
                </p>
              )}
              {submitError && (
                <p className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]" role="alert">
                  {submitError}
                </p>
              )}

              <button suppressHydrationWarning
                type="submit"
                disabled={isSubmitting}
                className="btn-primary self-start disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : (
                  <>Send Message <Send size={16} /></>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <h2 className="heading-md text-center">Frequently Asked Questions</h2>
          <div className="mx-auto mt-8 max-w-[760px] space-y-3">
            {faqs.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <div key={faq.q} className="card overflow-hidden">
                  <button suppressHydrationWarning
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-bold text-[var(--text)]">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-[var(--accent-hover)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <p className="body-text-sm px-5 pb-5">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
