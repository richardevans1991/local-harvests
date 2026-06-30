import FarmPageClient from "@/components/FarmPageClient";
import Header from "@/components/Header";

interface FarmPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function FarmPage({ params }: FarmPageProps) {
  const { id } = await params;

  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <FarmPageClient id={id} />
      </main>
    </>
  );
}