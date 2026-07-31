import Image from "next/image";
import { getGalleryPhotos } from "@/lib/content";

export default function GalleryPage() {
  const photos = getGalleryPhotos();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Gallery</h1>
      {photos.length === 0 ? (
        <p className="mt-4 text-lg">
          No photos uploaded yet — run the photo export/upload pipeline
          (see <code>scripts/export_photos_for_review.py</code> in the
          repo) to add some.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo) => (
            <figure key={photo.pathname}>
              <Image
                src={photo.url}
                alt={photo.caption || photo.pathname}
                width={400}
                height={400}
                className="h-auto w-full rounded object-cover"
              />
              {photo.caption && (
                <figcaption className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}
