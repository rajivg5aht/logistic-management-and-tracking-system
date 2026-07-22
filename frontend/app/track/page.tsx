import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PublicTrackingPanel from "@/components/tracking/PublicTrackingPanel";

export const metadata: Metadata = {
  title: "Track Your Shipment - CargoNep",
  description:
    "Track any CargoNep shipment by its tracking ID — live status and location, no login required.",
};

export default async function PublicTrackPage({
  searchParams,
}: {
  searchParams: Promise<{ trackingId?: string | string[] }>;
}) {
  const params = await searchParams;
  const trackingId = Array.isArray(params.trackingId)
    ? params.trackingId[0]
    : params.trackingId;

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Navbar />
      <main className="mx-auto w-full max-w-[1100px] px-5 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="mx-auto mb-8 max-w-xl text-center">
          <h1 className="text-3xl font-black text-[var(--text)]">
            Track your shipment
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Enter your tracking ID to see live status and location — no login
            required.
          </p>
        </div>
        <PublicTrackingPanel initialTrackingId={trackingId ?? ""} />
      </main>
      <Footer />
    </div>
  );
}
