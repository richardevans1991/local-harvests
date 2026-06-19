import FarmDirectory from "@/components/FarmDirectory";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <Hero />
        <FarmDirectory />
      </main>
      <footer className="border-t border-harvest-tan/40 bg-harvest-cream py-8 text-center text-sm text-harvest-brown/70">
        <p>© {new Date().getFullYear()} Local Harvest — Fresh food from farms near you.</p>
      </footer>
    </>
  );
}