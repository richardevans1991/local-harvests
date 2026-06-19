import FarmerDashboard from "@/components/FarmerDashboard";
import Header from "@/components/Header";

export default function FarmerDashboardPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <FarmerDashboard />
      </main>
    </>
  );
}