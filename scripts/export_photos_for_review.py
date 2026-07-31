#!/usr/bin/env python3
"""Export candidate electrical/project photos from the Photos library for manual review.

Usage:
    python3 scripts/export_photos_for_review.py [--since YYYY-MM-DD] [--until YYYY-MM-DD]
    python3 scripts/export_photos_for_review.py --label construction --label toolbox

Exports photos into photos-review/<run-timestamp>/ along with an index.html
contact sheet. Review the contact sheet, delete anything irrelevant from
that folder, then run web/scripts/upload-gallery-photos.ts against it.

--label filters to photos matching any of Apple's on-device Photos labels
(OR'd together when repeated). These are approximate, not a guarantee of
relevance -- e.g. "construction" and "toolbox" will likely include some
non-electrical DIY/tool photos too. When --label is given without --since
or --until, the whole library is searched instead of defaulting to a
recent date window.
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
    parser.add_argument(
        "--label",
        action="append",
        default=None,
        help="Filter to photos matching this on-device Photos label (repeatable, OR'd together)",
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
    labels = set(args.label) if args.label else None
    whole_archive = bool(labels) and not args.since and not args.until

    if whole_archive:
        since, until = None, None
        print(f"Searching the whole library for labels: {', '.join(sorted(labels))}...")
    else:
        since, until = resolve_date_range(args)
        range_desc = f"from {since.date()} to {until.date()}"
        if labels:
            print(f"Querying Photos library {range_desc} for labels: {', '.join(sorted(labels))}...")
        else:
            print(f"Querying Photos library for photos {range_desc}...")

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

    photos = list(db.photos(from_date=since, to_date=until))

    if labels:
        photos = [
            p for p in photos if p.labels_normalized and labels & set(p.labels_normalized)
        ]

    missing_count = sum(1 for p in photos if p.ismissing)
    if missing_count:
        print(
            f"{missing_count} of {len(photos)} matching photo(s) are iCloud-only "
            "(not downloaded locally) -- will ask Photos to fetch originals during export, "
            "which is slower than exporting local files."
        )

    if not photos:
        print("No photos found matching that query.")
        if until:
            save_last_export_date(until)
        return

    run_timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    export_dir = REVIEW_ROOT / run_timestamp
    export_dir.mkdir(parents=True, exist_ok=True)

    entries = []
    for photo in photos:
        exported = photo.export(str(export_dir), use_photos_export=True)
        for filename in exported:
            entries.append(
                {"filename": Path(filename).name, "date": photo.date.date().isoformat()}
            )

    build_contact_sheet(export_dir, entries)
    if until:
        save_last_export_date(until)

    print(f"Exported {len(entries)} photo(s) to {export_dir}")
    print(f"Open {export_dir / 'index.html'} in a browser to review, delete anything irrelevant, then run:")
    print(f"  cd web && npx tsx scripts/upload-gallery-photos.ts {export_dir}")


if __name__ == "__main__":
    main()
