export default function Hero() {
  return (
    <section className="relative px-4 py-16 sm:px-6 sm:py-24">
      <div className="relative mx-auto max-w-3xl text-center">
        <div className="home-glass rounded-3xl px-6 py-10 shadow-lg sm:px-10 sm:py-12">
          <p className="mb-3 inline-block rounded-full border border-harvest-green/25 bg-harvest-cream/70 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-harvest-brown">
            🌾 Your neighborhood farm marketplace
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-harvest-green-dark sm:text-5xl">
            Fresh food from farms near you
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-harvest-brown/90">
            Discover local farm shops, browse seasonal produce, and support the
            growers in your community.
          </p>
        </div>
      </div>
    </section>
  );
}