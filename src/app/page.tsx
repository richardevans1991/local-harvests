import FarmDirectory from "@/components/FarmDirectory";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeBackdrop from "@/components/HomeBackdrop";

export default function HomePage() {
  return (
    <>
      <Header />
      <HomeBackdrop />
      <main className="home-scene relative z-10 flex-1">
        <Hero />
        <FarmDirectory />
      </main>
      <footer className="home-glass relative z-10 border-t border-harvest-tan/30 py-8 text-center text-sm text-harvest-cream/90 shadow-[0_-4px_24px_rgb(0_0_0/0.08)]">
        <p>© {new Date().getFullYear()} Local Harvest — Fresh food from farms near you.</p>
      </footer>
    </>
  );
}