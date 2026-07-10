import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import LegalContent from "@/components/legal/LegalContent";

export const metadata: Metadata = {
  title: "Privacy Policy - CargoNep",
  description: "Read how CargoNep collects, uses, and protects customer, driver, and shipment information.",
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "We collect account details, contact information, shipment records, delivery addresses, payment or COD details, support messages, and tracking activity needed to provide logistics services.",
      "Drivers and operations users may also provide assignment updates, proof-of-delivery details, route activity, and status information related to active shipments.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use information to create shipments, assign drivers, track delivery progress, manage COD records, respond to inquiries, improve platform reliability, and protect users from misuse.",
      "We may use operational data to improve route planning, delivery visibility, customer support, analytics, and service quality across CargoNep.",
    ],
  },
  {
    title: "Sharing and Security",
    body: [
      "We share information only with users and team members who need it to complete delivery workflows, provide support, meet legal obligations, or keep the platform secure.",
      "We use reasonable technical and organizational safeguards to protect information, but no digital platform can guarantee absolute security.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You can update account information from your profile where available, contact support for data questions, and choose whether to continue using CargoNep services.",
      "Some shipment, payment, and delivery records may need to be retained for operational, legal, accounting, or dispute-resolution reasons.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Navbar />
      <main>
        <LegalContent
          title="Privacy Policy"
          description="This policy explains how CargoNep handles information while providing logistics management, shipment tracking, COD, and delivery services."
          lastUpdated="July 10, 2026"
          sections={sections}
        />
      </main>
      <Footer />
    </div>
  );
}