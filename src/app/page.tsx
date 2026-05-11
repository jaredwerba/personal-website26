import ContactForm from "@/components/ContactForm";
import GlitchHero from "@/components/GlitchHero";
import HeroVideo from "@/components/HeroVideo";

export default function Home() {
  return (
    <div className="space-y-8">
      <HeroVideo src="/home-hero.mp4" poster="/home-hero-poster.jpg" withSoundToggle />
      <GlitchHero />
      <ContactForm />
    </div>
  );
}
