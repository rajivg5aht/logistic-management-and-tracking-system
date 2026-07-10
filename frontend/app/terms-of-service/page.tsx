import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import LegalContent from "@/components/legal/LegalContent";

export const metadata: Metadata = {
  title: "Terms of Service - CargoNep",
  description: "Read the terms for using CargoNep logistics management and tracking services.",
};

const sections = [
  {
    title: "Using CargoNep",
    body: [
      "By using CargoNep, you agree to provide accurate account, shipment, pickup, delivery, and payment information.",
      "You are responsible for keeping your login details secure and for activity performed through your account.",
    ],
  },
  {
    title: "Shipments and Delivery",
    body: [
      "Shipment acceptance, routing, assignment, estimated delivery time, and final delivery may depend on service availability, weather, traffic, road conditions, package details, and operational constraints.",
      "Users must not submit prohibited, unsafe, illegal, or misleading shipment information through the platform.",
    ],
  },
  {
    title: "Payments and COD",
    body: [
      "Customers are responsible for applicable shipment charges, COD amounts, and any agreed fees shown or communicated during the booking and delivery workflow.",
      "COD records and payment status should be reviewed promptly. Disputes should be reported through support with relevant shipment details.",
    ],
  },
  {
    title: "Platform Availability",
    body: [
      "We aim to keep CargoNep reliable, but the service may be interrupted by maintenance, technical issues, network problems, or events outside our control.",
      "CargoNep may update features, workflows, or access rules to improve security, compliance, and service quality.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Navbar />
      <main>
        <LegalContent
          title="Terms of Service"
          description="These terms describe the basic rules for using CargoNep's logistics, tracking, driver, COD, and customer service workflows."
          lastUpdated="July 10, 2026"
          sections={sections}
        />
      </main>
      <Footer />
    </div>
  );
}