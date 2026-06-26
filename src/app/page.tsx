import FarmDirectory from "@/components/FarmDirectory";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeBackdrop from "@/components/HomeBackdrop";
import HowItWorks from "@/components/HowItWorks";
import SiteFooter from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <>
      <Header />
      <HomeBackdrop />
      <main className="home-scene relative z-10 flex-1">
        <Hero />
        <FarmDirectory />
        <HowItWorks variant="home" />
      </main>
      <SiteFooter variant="home" />
    </>
  );
}