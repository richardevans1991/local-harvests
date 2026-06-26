import Header from "@/components/Header";
import HowItWorks from "@/components/HowItWorks";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <HowItWorks />
        <div className="mx-auto max-w-3xl px-4 pb-16 text-center sm:px-6">
          <Link
            href="/"
            className="inline-block rounded-full bg-harvest-green px-6 py-3 text-sm font-medium text-harvest-brown hover:bg-harvest-green-dark hover:text-white"
          >
            Start browsing farms
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}