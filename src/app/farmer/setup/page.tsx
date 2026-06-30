import FarmerSetupForm from "@/components/FarmerSetupForm";
import Header from "@/components/Header";

export default function FarmerSetupPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-harvest-cream px-4 py-12">
        <FarmerSetupForm />
      </main>
    </>
  );
}