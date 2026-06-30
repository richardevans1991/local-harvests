import type { ReactNode } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

interface LegalPageLayoutProps {
  badge: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  badge,
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="inline-block rounded-full border border-harvest-green/30 bg-white/80 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-harvest-brown">
            {badge}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold text-harvest-green sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-harvest-brown/70">Last updated: {lastUpdated}</p>

          <div className="legal-prose mt-10 space-y-8 text-harvest-brown/90">{children}</div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-harvest-tan/50 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-serif text-xl font-semibold text-harvest-green">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}