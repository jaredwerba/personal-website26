type Props = {
  src: string;
  poster?: string;
};

export default function HeroVideo({ src, poster }: Props) {
  return (
    <video
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className="block w-full h-auto"
    />
  );
}
