import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import LegalContent from "@/components/legal/LegalContent";

export const metadata: Metadata = {
  title: "Cookie Policy - CargoNep",
  description: "Learn how CargoNep may use cookies and similar technologies.",
};

const sections = [
  {
    title: "What Cookies Are",
    body: [
      "Cookies are small files stored on your device that help websites remember basic preferences, login sessions, and usage information.",
      "Similar technologies may include local storage, session storage, pixels, or analytics identifiers used to keep the platform working smoothly.",
    ],
  },
  {
    title: "How We Use Cookies",
    body: [
      "CargoNep may use essential cookies to support login sessions, security, form behavior, account access, and core platform functionality.",
      "We may also use preference or analytics technologies to understand performance, improve navigation, and make the service easier to use.",
    ],
  },
  {
    title: "Managing Cookies",
    body: [
      "You can control cookies through your browser settings. Blocking some cookies may affect login, dashboard, tracking, or form functionality.",
      "If CargoNep adds optional analytics or marketing cookies in the future, we may provide additional controls where required.",
    ],
  },
  {
    title: "Updates",
    body: [
      "We may update this Cookie Policy when we change the technologies used by CargoNep or improve the platform.",
      "Continued use of CargoNep after updates means you accept the revised cookie practices described here.",
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Navbar />
      <main>
        <LegalContent
          title="Cookie Policy"
          description="This policy explains how CargoNep uses cookies and similar technologies to support secure, reliable, and user-friendly logistics workflows."
          lastUpdated="July 10, 2026"
          sections={sections}
        />
      </main>
      <Footer />
    </div>
  );
}