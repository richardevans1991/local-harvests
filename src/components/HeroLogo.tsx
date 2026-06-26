import Image from "next/image";

export default function HeroLogo() {
  return (
    <div className="hero-logo-wrap mx-auto w-fit">
      <Image
        src="/logos/logo-transparent.svg"
        alt="Local Harvest"
        width={520}
        height={130}
        className="h-16 w-auto sm:h-24 md:h-32"
        priority
      />
    </div>
  );
}