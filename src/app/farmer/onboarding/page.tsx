import FarmerOnboarding from "@/components/FarmerOnboarding";
import Header from "@/components/Header";

export default function FarmerOnboardingPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <FarmerOnboarding />
      </main>
    </>
  );
}