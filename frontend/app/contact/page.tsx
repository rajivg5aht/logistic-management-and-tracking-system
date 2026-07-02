import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ContactContent from "@/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact Us — CargoNep",
  description: "Get in touch with the CargoNep team for delivery support, business partnerships, and logistics questions across Nepal.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Navbar />
      <main>
        <ContactContent />
      </main>
      <Footer />
    </div>
  );
}
