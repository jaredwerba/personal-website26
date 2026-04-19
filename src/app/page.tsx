import ContactForm from "@/components/ContactForm";
import HeroVideo from "@/components/HeroVideo";

export default function Home() {
  return (
    <div className="space-y-8">
      <HeroVideo src="/home-hero.mp4" poster="/home-hero-poster.jpg" />
      <ContactForm />
    </div>
  );
}
