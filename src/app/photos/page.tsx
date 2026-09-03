import { listPhotos, PHOTO_LOCATIONS } from "@/lib/photos";
import PhotoGallery from "./PhotoGallery";

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  const photos = await listPhotos();

  return (
    <div className="space-y-6">
      {photos.length === 0 ? (
        <>
          <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
            PHOTOS
          </h2>
          <div
            className="border border-nerv-green/40 bg-nerv-black text-nerv-green p-4 text-xs"
            style={{ fontFamily: "var(--font-nerv-mono)" }}
          >
            <p>&gt; NO IMAGES FOUND IN /public/photos/</p>
          </div>
        </>
      ) : (
        <PhotoGallery photos={photos} />
      )}

      <div
        className="border border-nerv-green/40 bg-nerv-black text-nerv-green"
        style={{ fontFamily: "var(--font-nerv-mono)" }}
      >
        <div className="flex items-center justify-between px-3 py-1 border-b border-nerv-green/20 bg-nerv-green/5">
          <span
            className="text-[10px] uppercase tracking-[0.2em] font-bold"
            style={{ fontFamily: "var(--font-nerv-display)" }}
          >
            ARCHIVE
          </span>
          <span className="text-[10px] text-nerv-green/50">
            {PHOTO_LOCATIONS.length} PLACES
          </span>
        </div>
        <div className="p-3 text-xs">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {PHOTO_LOCATIONS.map((loc) => (
              <span key={loc} className="text-[11px] text-nerv-green/60 tracking-wider">
                {loc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
