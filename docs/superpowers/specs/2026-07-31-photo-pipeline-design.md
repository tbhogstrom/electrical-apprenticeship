# Photo Pipeline (osxphotos → Vercel Blob → Gallery) — Design

## Goal

A repeatable workflow to find electrical/house-project photos in the local
macOS Photos library, let the user curate them, upload the keepers to
Vercel Blob storage, and display them on a `/gallery` page on the
portfolio site. This is additive to the existing repo — see
[`2026-07-31-portfolio-web-app-design.md`](2026-07-31-portfolio-web-app-design.md)
for the site this feeds into.

## Context

The Photos library is not organized with a dedicated album or keyword for
electrical/project photos, and Apple's on-device photo labels are not
reliable enough to auto-detect "this is an electrical photo." The design
therefore uses a **date-bounded export + manual curation** step rather
than any automatic content classification — the user decides what
actually leaves the local machine, since Blob storage with public access
means unauthenticated, indexable URLs.

## Pipeline

Three steps, meant to be rerun repeatedly over the coming year as more
project photos are taken:

### 1. Export candidates for review

`scripts/export_photos_for_review.py` (Python, `osxphotos`):

- Takes a date range. Defaults to "since the last successful export,"
  tracked in a local, gitignored state file
  (`scripts/.photo-export-state.json`); falls back to the last 30 days on
  first run. Accepts `--since YYYY-MM-DD` and `--until YYYY-MM-DD` to
  override.
- Queries the Photos library via `osxphotos.PhotosDB()` for photos in that
  date range and exports the originals into a local, gitignored folder:
  `photos-review/<run-timestamp>/`.
- Generates a simple `index.html` contact sheet in that same folder —
  thumbnails (the exported images themselves, CSS-scaled — no separate
  thumbnail generation) with filename and date-taken captions — so the
  full candidate set can be reviewed in a browser in one pass.
- Requires Full Disk Access for the terminal/host process to read the
  Photos library; the script should surface a clear error message
  pointing at System Settings if that permission is missing, rather than
  failing with a raw exception.

### 2. Curate (manual, no tooling)

The user opens `photos-review/<run-timestamp>/index.html`, reviews the
contact sheet, and deletes any files from that folder that aren't
relevant. Whatever image files remain when the next step runs are treated
as "approved for upload."

### 3. Upload

`web/scripts/upload-gallery-photos.ts` (Node/TypeScript, `@vercel/blob`):

- Reads all image files remaining in the most recent
  `photos-review/<run-timestamp>/` folder.
- Uploads each to Blob storage under a `gallery/` path prefix, with
  `access: 'public'`, using a collision-resistant blob pathname
  (`gallery/<original-filename-stem>-<short-hash>.<ext>`).
- Appends an entry per uploaded photo to `web/content/gallery.json`:
  `{ url, pathname, caption: "", dateTaken, uploadedAt }`. `caption`
  starts empty and is hand-edited later, same convention as other curated
  content in this repo.
- On success, deletes the local `photos-review/<run-timestamp>/` folder
  (originals and contact sheet) so the export step starts clean next
  time, and updates `scripts/.photo-export-state.json` with the export's
  end date.
- Vercel Blob auth: the project already has a Blob store attached
  (`BLOB_STORE_ID` + OIDC-based auth via `VERCEL_OIDC_TOKEN`, both
  present in `web/.env.local` after `vercel env pull`) — no separate
  `BLOB_READ_WRITE_TOKEN` needed.

### 4. Gallery page

`web/app/gallery/page.tsx`:

- Reads `web/content/gallery.json` (via a new `getGalleryPhotos()` in
  `web/lib/content.ts`, following the same pattern as `getProjects()` /
  `getNotebooks()`).
- Renders a responsive image grid (CSS grid, `next/image` for each
  photo), newest-first, showing the caption underneath each photo when
  present.
- Added to the shared nav (`web/components/NavBar.tsx`).

## Data & privacy notes

- `photos-review/` (repo root) is added to `.gitignore` — raw exported
  photos, including ones later deleted during curation, are never
  committed.
- `scripts/.photo-export-state.json` is also gitignored — it's a local
  convenience cache (last export date), not meaningful shared state.
- Only `web/content/gallery.json` (URLs + captions/metadata, no image
  bytes) is committed — consistent with the "curated public layer" used
  elsewhere in `web/content/`.
- Uploaded photos are public (unauthenticated URLs) by design, matching
  the site's existing public-portfolio posture — this was already
  established and accepted in the base portfolio design; this spec
  doesn't reopen that decision, only flags that curation (step 2) is the
  actual control point for what becomes public.

## Out of scope

- No automatic classification/tagging of photos by content (see Context,
  above) — this is a deliberate simplification, not a placeholder for
  later automation.
- No photo editing/cropping/resizing pipeline — originals are uploaded
  as exported by osxphotos.
- No UI for editing captions in `gallery.json` — captions are hand-edited
  in the JSON file directly, same as other content files in this repo.
- No per-project photo attachment (a general gallery only, per the
  decision made during brainstorming) — wiring specific photos to
  specific project case studies is separate, later work if wanted.
