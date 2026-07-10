import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AboutContent from "@/components/about/AboutContent";

export const metadata: Metadata = {
  title: "About Us - CargoNep",
  description:
    "Learn about CargoNep, a Logistics Management and Tracking System for Nepal built for admins, customers, and drivers.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Navbar />
      <main>
        <AboutContent />
      </main>
      <Footer />
    </div>
  );
}
