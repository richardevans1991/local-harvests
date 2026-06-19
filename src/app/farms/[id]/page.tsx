import FarmPageClient from "@/components/FarmPageClient";
import Header from "@/components/Header";
import { SAMPLE_FARMS } from "@/lib/sample-data";

interface FarmPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return SAMPLE_FARMS.map((farm) => ({ id: farm.id }));
}

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