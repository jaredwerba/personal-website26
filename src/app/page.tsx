import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <div className="space-y-8">
      <video
        src="/home-hero.mp4"
        poster="/home-hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="block w-full h-auto"
      />

      <ContactForm />
    </div>
  );
}
