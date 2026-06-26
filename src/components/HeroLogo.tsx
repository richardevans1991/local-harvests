import Image from "next/image";

export default function HeroLogo() {
  return (
    <div className="hero-logo-wrap mx-auto w-fit">
      <Image
        src="/logos/logo-hero-light.png"
        alt="Local Harvest"
        width={1152}
        height={864}
        className="h-[4.5rem] w-auto sm:h-28 md:h-36"
        priority
      />
    </div>
  );
}