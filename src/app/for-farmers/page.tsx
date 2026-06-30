import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { getShowcaseFarm } from "@/lib/showcase-farm";
import Link from "next/link";

const benefits = [
  "Your own online farm shop with photos and categories",
  "Click & collect and delivery options",
  "Secure customer checkout with Stripe",
  "Order notifications when customers buy",
  "30-day free trial — plans from £19/month",
];

export default async function ForFarmersPage() {
  const showcaseFarm = await getShowcaseFarm();

  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="inline-block rounded-full border border-harvest-green/30 bg-white/80 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-harvest-brown">
            For farm shops
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold text-harvest-green sm:text-5xl">
            Sell online. Stay local.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-harvest-brown/90">
            Local Harvest helps UK farm shops reach customers in their area — without
            the hassle of building a website from scratch. We handle the shop, payments,
            and orders. You focus on great produce.
          </p>

          <ul className="mt-8 space-y-3">
            {benefits.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-harvest-tan/50 bg-white px-4 py-3 text-harvest-brown"
              >
                <span className="text-harvest-green" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/farmer/register"
              className="rounded-full bg-harvest-green px-6 py-3 text-sm font-semibold text-harvest-brown shadow-sm hover:bg-harvest-green-dark hover:text-white"
            >
              Get started free
            </Link>
            <Link
              href="/farmer/plans"
              className="rounded-full border border-harvest-green px-6 py-3 text-sm font-semibold text-harvest-green hover:bg-harvest-green hover:text-white"
            >
              View plans
            </Link>
            {showcaseFarm && (
              <Link
                href={`/farms/${showcaseFarm.id}`}
                className="rounded-full border border-harvest-tan bg-white px-6 py-3 text-sm font-semibold text-harvest-brown hover:border-harvest-green hover:text-harvest-green"
              >
                See a live example — {showcaseFarm.name}
              </Link>
            )}
          </div>

          <p className="mt-8 text-sm text-harvest-brown/70">
            Questions? Email{" "}
            <a href="mailto:hello@local-harvests.co.uk" className="text-harvest-green hover:underline">
              hello@local-harvests.co.uk
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}