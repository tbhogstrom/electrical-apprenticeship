# Photo Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the three-step photo pipeline (osxphotos export → manual curation → Blob upload) and the `/gallery` page, per the approved design.

**Architecture:** A Python export script (`scripts/`) talks to the local Photos library and writes to a gitignored local folder — no dependency on the Next.js app. A Node/TypeScript upload script (`web/scripts/`) reads that folder and calls `@vercel/blob`, sharing `web/lib/content.ts` conventions with the rest of the site. A new `getGalleryPhotos()` function and `/gallery` page follow the exact pattern already used for projects/notebooks.

**Tech Stack:** Python 3.11 + `osxphotos` (export script), Node/TypeScript + `@vercel/blob` + `tsx` (upload script), Next.js App Router (gallery page).

## Global Constraints

- `photos-review/` (repo root) and `scripts/.photo-export-state.json` are gitignored — raw photo exports and the local state cache are never committed.
- Only `web/content/gallery.json` (URLs + metadata, no image bytes) is committed.
- **Never upload real, uncurated photos during implementation/verification.** The design's whole privacy model rests on the human curation step (deleting irrelevant files from the review folder) happening before anything is uploaded. Task 4's verification uses a synthetic throwaway test image, not real Photos library output, and cleans up (deletes) the test blob afterward.
- Vercel Blob auth relies on `BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN` already present in `web/.env.local` (pulled via `vercel env pull`) — no separate `BLOB_READ_WRITE_TOKEN` setup needed.
- Commit after each task with a descriptive message.

---

### Task 1: Python export script

**Files:**
- Create: `scripts/export_photos_for_review.py`
- Create: `scripts/requirements.txt`
- Create: `.gitignore` (repo root)

**Interfaces:**
- Produces: `photos-review/<run-timestamp>/` folders containing exported images + `index.html`, and `scripts/.photo-export-state.json` tracking the last export's end date. Task 4's upload script takes a `photos-review/<run-timestamp>/` path as its argument.

- [ ] **Step 1: Create the repo-root `.gitignore`**

```
photos-review/
scripts/.photo-export-state.json
```

- [ ] **Step 2: Create `scripts/requirements.txt`**

```
osxphotos>=0.75.9
```

- [ ] **Step 3: Create `scripts/export_photos_for_review.py`**

```python
#!/usr/bin/env python3
"""Export candidate electrical/project photos from the Photos library for manual review.

Usage:
    python3 scripts/export_photos_for_review.py [--since YYYY-MM-DD] [--until YYYY-MM-DD]

Exports photos into photos-review/<run-timestamp>/ along with an index.html
contact sheet. Review the contact sheet, delete anything irrelevant from
that folder, then run web/scripts/upload-gallery-photos.ts against it.
"""

import argparse
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Tuple

import osxphotos

REPO_ROOT = Path(__file__).resolve().parent.parent
STATE_FILE = Path(__file__).resolve().parent / ".photo-export-state.json"
REVIEW_ROOT = REPO_ROOT / "photos-review"
DEFAULT_LOOKBACK_DAYS = 30


def load_last_export_date() -> Optional[datetime]:
    if not STATE_FILE.exists():
        return None
    data = json.loads(STATE_FILE.read_text())
    last = data.get("last_export_end_date")
    return datetime.fromisoformat(last) if last else None


def save_last_export_date(end_date: datetime) -> None:
    STATE_FILE.write_text(
        json.dumps({"last_export_end_date": end_date.date().isoformat()})
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--since",
        type=str,
        default=None,
        help="YYYY-MM-DD, defaults to since the last successful export (or 30 days back on first run)",
    )
    parser.add_argument(
        "--until", type=str, default=None, help="YYYY-MM-DD, defaults to today"
    )
    return parser.parse_args()


def resolve_date_range(args: argparse.Namespace) -> Tuple[datetime, datetime]:
    until = datetime.fromisoformat(args.until) if args.until else datetime.now()
    if args.since:
        since = datetime.fromisoformat(args.since)
    else:
        last = load_last_export_date()
        since = last if last else (datetime.now() - timedelta(days=DEFAULT_LOOKBACK_DAYS))
    return since, until


def build_contact_sheet(export_dir: Path, entries: list) -> None:
    rows = "\n".join(
        f'<figure><img src="{e["filename"]}" loading="lazy" '
        f'style="max-width:300px;max-height:300px;">'
        f'<figcaption>{e["filename"]}<br>{e["date"]}</figcaption></figure>'
        for e in entries
    )
    html = f"""<!doctype html>
<html><head><meta charset="utf-8"><title>Photo review</title>
<style>
body {{ font-family: sans-serif; background: #111; color: #eee; }}
figure {{ display: inline-block; margin: 8px; }}
figcaption {{ font-size: 12px; word-break: break-all; }}
</style></head>
<body>
<h1>Photo review &mdash; {len(entries)} candidates</h1>
<p>Delete files from this folder for anything you don't want uploaded, then run the upload script.</p>
{rows}
</body></html>
"""
    (export_dir / "index.html").write_text(html)


def main() -> None:
    args = parse_args()
    since, until = resolve_date_range(args)

    print(f"Querying Photos library for photos from {since.date()} to {until.date()}...")

    try:
        db = osxphotos.PhotosDB()
    except Exception as e:
        print(
            "Could not open the Photos library. This usually means the "
            "terminal/app running this script needs Full Disk Access: "
            "System Settings > Privacy & Security > Full Disk Access.",
            file=sys.stderr,
        )
        print(f"Underlying error: {e}", file=sys.stderr)
        sys.exit(1)

    photos = [
        p for p in db.photos(from_date=since, to_date=until) if not p.ismissing
    ]

    if not photos:
        print("No photos found in that date range.")
        save_last_export_date(until)
        return

    run_timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    export_dir = REVIEW_ROOT / run_timestamp
    export_dir.mkdir(parents=True, exist_ok=True)

    entries = []
    for photo in photos:
        exported = photo.export(str(export_dir))
        for filename in exported:
            entries.append(
                {"filename": Path(filename).name, "date": photo.date.date().isoformat()}
            )

    build_contact_sheet(export_dir, entries)
    save_last_export_date(until)

    print(f"Exported {len(entries)} photo(s) to {export_dir}")
    print(f"Open {export_dir / 'index.html'} in a browser to review, delete anything irrelevant, then run:")
    print(f"  cd web && npx tsx scripts/upload-gallery-photos.ts {export_dir}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Verify syntax**

```bash
python3 -m py_compile ~/electrical-apprenticeship/scripts/export_photos_for_review.py
```

Expected: no output, exit code 0.

- [ ] **Step 5: Run it for real to verify the pipeline mechanics**

This only reads the local Photos library and writes to a gitignored local
folder — no upload, nothing public, safe to run for real:

```bash
cd ~/electrical-apprenticeship
python3 scripts/export_photos_for_review.py
```

Expected: either "No photos found in that date range." (fine — the
library may have nothing in the last 30 days), or a
`photos-review/<timestamp>/` folder containing exported images and an
`index.html`. If it fails with a Photos-library-access error, follow the
script's own Full Disk Access instructions before proceeding.

- [ ] **Step 6: Commit**

```bash
cd ~/electrical-apprenticeship
git add .gitignore scripts/export_photos_for_review.py scripts/requirements.txt
git commit -m "Add photo export script for review pipeline"
```

---

### Task 2: `getGalleryPhotos()` content utility with tests

**Files:**
- Modify: `web/lib/content.ts`
- Modify: `web/lib/content.test.ts`
- Create: `web/content/gallery.json`

**Interfaces:**
- Produces: `type GalleryPhoto = { url: string; pathname: string; caption: string; uploadedAt: string }` and `getGalleryPhotos(filePath?: string): GalleryPhoto[]`, consumed by Task 5's gallery page and written to by Task 4's upload script.

- [ ] **Step 1: Add the failing test to `web/lib/content.test.ts`**

Add this `describe` block (and add `getGalleryPhotos` to the existing
import from `"./content"` at the top of the file):

```typescript
describe("getGalleryPhotos", () => {
  let filePath: string;

  beforeAll(() => {
    const dir = mkdtempSync(join(tmpdir(), "gallery-"));
    filePath = join(dir, "gallery.json");
    writeFileSync(
      filePath,
      JSON.stringify([
        {
          url: "https://example.public.blob.vercel-storage.com/gallery/panel-abc123.jpg",
          pathname: "gallery/panel-abc123.jpg",
          caption: "New panel installed",
          uploadedAt: "2026-09-01T12:00:00.000Z",
        },
      ])
    );
  });

  it("returns the parsed gallery photo list", () => {
    const photos = getGalleryPhotos(filePath);
    expect(photos).toHaveLength(1);
    expect(photos[0].caption).toBe("New panel installed");
  });

  it("returns an empty array when the file doesn't exist", () => {
    expect(getGalleryPhotos("/nonexistent/gallery.json")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify this one fails**

```bash
cd ~/electrical-apprenticeship/web && npm test
```

Expected: FAIL — `getGalleryPhotos` is not exported from `./content`.

- [ ] **Step 3: Add `getGalleryPhotos` to `web/lib/content.ts`**

Add near the bottom of the file:

```typescript
const DEFAULT_GALLERY_FILE = join(process.cwd(), "content/gallery.json");

export type GalleryPhoto = {
  url: string;
  pathname: string;
  caption: string;
  uploadedAt: string;
};

export function getGalleryPhotos(
  filePath: string = DEFAULT_GALLERY_FILE
): GalleryPhoto[] {
  if (!existsSync(filePath)) return [];
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as GalleryPhoto[];
}
```

- [ ] **Step 4: Create `web/content/gallery.json`**

```json
[]
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd ~/electrical-apprenticeship/web && npm test
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
cd ~/electrical-apprenticeship
git add web/lib/content.ts web/lib/content.test.ts web/content/gallery.json
git commit -m "Add getGalleryPhotos content utility"
```

---

### Task 3: Blob pathname helper with tests

**Files:**
- Create: `web/lib/blob-pathname.ts`
- Create: `web/lib/blob-pathname.test.ts`

**Interfaces:**
- Produces: `buildBlobPathname(localFilePath: string, fileContents: Buffer): string`, consumed by Task 4's upload script.

- [ ] **Step 1: Write the failing test**

Create `web/lib/blob-pathname.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildBlobPathname } from "./blob-pathname";

describe("buildBlobPathname", () => {
  it("builds a gallery-prefixed pathname with a content hash", () => {
    const pathname = buildBlobPathname(
      "/tmp/photos-review/run-1/IMG_0001.jpg",
      Buffer.from("fake image bytes")
    );
    expect(pathname).toMatch(/^gallery\/IMG_0001-[0-9a-f]{8}\.jpg$/);
  });

  it("produces the same pathname for the same file contents", () => {
    const contents = Buffer.from("identical bytes");
    const first = buildBlobPathname("/a/photo.png", contents);
    const second = buildBlobPathname("/b/photo.png", contents);
    expect(first).toBe(second);
  });

  it("produces different pathnames for different file contents", () => {
    const first = buildBlobPathname("/a/photo.png", Buffer.from("one"));
    const second = buildBlobPathname("/a/photo.png", Buffer.from("two"));
    expect(first).not.toBe(second);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd ~/electrical-apprenticeship/web && npm test
```

Expected: FAIL — `./blob-pathname` module not found.

- [ ] **Step 3: Implement `web/lib/blob-pathname.ts`**

```typescript
import { createHash } from "crypto";

export function buildBlobPathname(
  localFilePath: string,
  fileContents: Buffer
): string {
  const filename = localFilePath.split("/").pop() ?? localFilePath;
  const dotIndex = filename.lastIndexOf(".");
  const stem = dotIndex === -1 ? filename : filename.slice(0, dotIndex);
  const ext = dotIndex === -1 ? "" : filename.slice(dotIndex + 1);
  const hash = createHash("sha256")
    .update(fileContents)
    .digest("hex")
    .slice(0, 8);
  return ext ? `gallery/${stem}-${hash}.${ext}` : `gallery/${stem}-${hash}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd ~/electrical-apprenticeship/web && npm test
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/electrical-apprenticeship
git add web/lib/blob-pathname.ts web/lib/blob-pathname.test.ts
git commit -m "Add blob pathname helper with unit tests"
```

---

### Task 4: Upload script

**Files:**
- Create: `web/scripts/upload-gallery-photos.ts`
- Modify: `web/package.json` (add `tsx` devDependency and an `upload-gallery-photos` script)

**Interfaces:**
- Consumes: `buildBlobPathname` (Task 3), `GalleryPhoto` type (Task 2), `@vercel/blob`'s `put`.
- Produces: updates to `web/content/gallery.json`; deletes the folder it was pointed at on success.

- [ ] **Step 1: Install `@vercel/blob` and `tsx`**

```bash
cd ~/electrical-apprenticeship/web
npm install @vercel/blob
npm install -D tsx
```

- [ ] **Step 2: Add the run script to `web/package.json`**

Add to `"scripts"`:

```json
"upload-gallery-photos": "tsx scripts/upload-gallery-photos.ts"
```

- [ ] **Step 3: Create `web/scripts/upload-gallery-photos.ts`**

```typescript
import { readFileSync, readdirSync, writeFileSync, rmSync, extname } from "fs";
import { join } from "path";
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
```

- [ ] **Step 4: Verify with a synthetic throwaway image — do NOT use real photo library output**

This confirms the full pipeline (Blob upload + gallery.json update +
folder cleanup) works, using a harmless 1x1 pixel PNG rather than any
real photo, since nothing from an uncurated real export should ever be
uploaded:

```bash
cd ~/electrical-apprenticeship/web
mkdir -p /tmp/photo-pipeline-smoke-test
python3 -c "
import base64
png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=')
open('/tmp/photo-pipeline-smoke-test/test-pixel.png', 'wb').write(png)
"
npm run upload-gallery-photos -- /tmp/photo-pipeline-smoke-test
```

Expected: "Uploaded test-pixel.png -> https://...", then "Uploaded 1
photo(s). Removed local review folder." Confirm `content/gallery.json`
now has a new entry at the top with that URL.

- [ ] **Step 5: Clean up the smoke-test blob**

Don't leave the throwaway test image live in production Blob storage.
Remove both the blob and the `gallery.json` entry it created:

```bash
cd ~/electrical-apprenticeship/web
node -e "
const { del } = require('@vercel/blob');
const gallery = require('./content/gallery.json');
const testEntry = gallery.find(g => g.pathname.startsWith('gallery/test-pixel'));
if (testEntry) { del(testEntry.url).then(() => console.log('deleted', testEntry.url)); }
"
```

Then manually remove that same entry from `web/content/gallery.json` so
the committed file has no test data in it (it should go back to `[]`
unless real entries already exist from prior use).

- [ ] **Step 6: Verify `gallery.json` is back to a clean state**

```bash
cat ~/electrical-apprenticeship/web/content/gallery.json
```

Expected: `[]` (or whatever real entries existed before this task, if
any — just confirm no `test-pixel` entry remains).

- [ ] **Step 7: Commit**

```bash
cd ~/electrical-apprenticeship
git add web/scripts/upload-gallery-photos.ts web/package.json web/package-lock.json web/content/gallery.json
git commit -m "Add gallery photo upload script"
```

---

### Task 5: Gallery page

**Files:**
- Create: `web/app/gallery/page.tsx`
- Modify: `web/components/NavBar.tsx`
- Modify: `web/next.config.ts`

**Interfaces:**
- Consumes: `getGalleryPhotos`, `GalleryPhoto` from `web/lib/content.ts` (Task 2).

- [ ] **Step 1: Allow Vercel Blob's image host in `web/next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Create `web/app/gallery/page.tsx`**

```tsx
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
```

- [ ] **Step 3: Add Gallery to `web/components/NavBar.tsx`**

Read the file first, then add `{ href: "/gallery", label: "Gallery" }` to
the `links` array, between the Projects and Math entries:

```typescript
const links = [
  { href: "/", label: "Home" },
  { href: "/timeline", label: "Timeline" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery", label: "Gallery" },
  { href: "/math", label: "Math" },
  { href: "/about", label: "About" },
];
```

- [ ] **Step 4: Verify the app builds**

```bash
cd ~/electrical-apprenticeship/web && npm run build
```

Expected: build succeeds, `/gallery` route present.

- [ ] **Step 5: Commit**

```bash
cd ~/electrical-apprenticeship
git add web/
git commit -m "Add gallery page"
```

---

### Task 6: Final integration check and redeploy

**Files:**
- None created — verification and deployment only.

**Interfaces:**
- Consumes: everything from Tasks 1-5.

- [ ] **Step 1: Run the full test suite**

```bash
cd ~/electrical-apprenticeship/web && npm test
```

Expected: all tests pass (existing content.ts tests + new
getGalleryPhotos + buildBlobPathname tests).

- [ ] **Step 2: Run the full build**

```bash
cd ~/electrical-apprenticeship/web && npm run build
```

Expected: build succeeds, routes include `/gallery`.

- [ ] **Step 3: Confirm no test/smoke-test artifacts remain**

```bash
cd ~/electrical-apprenticeship
git status --porcelain
cat web/content/gallery.json
```

Expected: clean working tree (everything committed), and
`web/content/gallery.json` contains no `test-pixel` entries.

- [ ] **Step 4: Push and redeploy**

```bash
cd ~/electrical-apprenticeship
git push
cd web && vercel --prod
```

- [ ] **Step 5: Verify the live `/gallery` route**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://web-ruby-seven-18.vercel.app/gallery
```

Expected: `200`.

- [ ] **Step 6: Tell the user how to run the real pipeline**

No code step — just make sure the user knows the actual first real run
is manual and theirs to do: `python3 scripts/export_photos_for_review.py`,
review/curate `photos-review/<timestamp>/index.html`, then
`npm run upload-gallery-photos -- ../photos-review/<timestamp>` from
`web/`.
