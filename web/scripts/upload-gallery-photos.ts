import { readFileSync, readdirSync, writeFileSync, rmSync } from "fs";
import { join, extname } from "path";
import { put } from "@vercel/blob";
import { buildBlobPathname } from "../lib/blob-pathname";
import type { GalleryPhoto } from "../lib/content";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".gif"];

async function main() {
  const reviewDir = process.argv[2];
  if (!reviewDir) {
    console.error(
      "Usage: npm run upload-gallery-photos -- <photos-review/run-folder>"
    );
    process.exit(1);
  }

  const files = readdirSync(reviewDir).filter((f) =>
    IMAGE_EXTENSIONS.includes(extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.log("No image files found in that folder.");
    return;
  }

  const galleryPath = join(process.cwd(), "content/gallery.json");
  const existing: GalleryPhoto[] = JSON.parse(readFileSync(galleryPath, "utf-8"));

  const newEntries: GalleryPhoto[] = [];
  for (const file of files) {
    const filePath = join(reviewDir, file);
    const contents = readFileSync(filePath);
    const pathname = buildBlobPathname(filePath, contents);
    const blob = await put(pathname, contents, { access: "public" });
    newEntries.push({
      url: blob.url,
      pathname: blob.pathname,
      caption: "",
      uploadedAt: new Date().toISOString(),
    });
    console.log(`Uploaded ${file} -> ${blob.url}`);
  }

  writeFileSync(
    galleryPath,
    JSON.stringify([...newEntries, ...existing], null, 2)
  );
  rmSync(reviewDir, { recursive: true, force: true });
  console.log(
    `Uploaded ${newEntries.length} photo(s). Removed local review folder.`
  );
}

main();
