import HeroLogo from "@/components/HeroLogo";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-harvest-brown/35 via-harvest-brown/10 to-transparent sm:h-[32rem]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <HeroLogo />

        <p className="hero-eyebrow mt-8 inline-block rounded-full border border-harvest-cream/35 bg-harvest-cream/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-harvest-cream backdrop-blur-sm">
          🌾 Your neighborhood farm marketplace
        </p>

        <h1 className="hero-heading mt-5 font-serif text-4xl font-bold leading-tight text-harvest-cream sm:text-5xl md:text-6xl">
          Fresh food from farms near you
        </h1>

        <p className="hero-subheading mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-harvest-cream/95 sm:text-xl">
          Discover local farm shops, browse seasonal produce, and support the
          growers in your community.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#farms"
            className="rounded-full bg-harvest-cream px-7 py-3 text-sm font-semibold text-harvest-brown shadow-md transition hover:bg-white"
          >
            Browse farm shops
          </a>
          <a
            href="/for-farmers"
            className="rounded-full border border-harvest-cream/50 bg-harvest-cream/10 px-7 py-3 text-sm font-semibold text-harvest-cream backdrop-blur-sm transition hover:border-harvest-cream hover:bg-harvest-cream/20"
          >
            List your farm
          </a>
        </div>
      </div>
    </section>
  );
}