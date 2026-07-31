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
