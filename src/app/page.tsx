import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import HeroVideo from "@/components/HeroVideo";

export default function Home() {
  return (
    <div className="space-y-8">
      <HeroVideo src="/home-hero.mp4" poster="/home-hero-poster.jpg" withSoundToggle />
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src="/photos/figher.JPG"
          alt=""
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nerv-black via-nerv-black/20 to-transparent" />
      </div>
      <ContactForm />
    </div>
  );
}
