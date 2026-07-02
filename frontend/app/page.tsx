import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CoreSolutions from "@/components/landing/CoreSolutions";
import Stats from "@/components/landing/Stats";
import Network from "@/components/landing/Network";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Navbar />
      <main>
        <Hero />
        <CoreSolutions />
        <Stats />
        <Network />
      </main>
      <Footer />
    </div>
  );
}
