import AuthForm from "@/components/AuthForm";
import Header from "@/components/Header";

export default function FarmerLoginPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-harvest-cream px-4 py-12">
        <AuthForm mode="login" role="farmer" />
      </main>
    </>
  );
}