import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  getProjects,
  getProjectBySlug,
  getMathProgress,
  getNotebooks,
  getGalleryPhotos,
} from "./content";

describe("getProjects", () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "projects-"));
    writeFileSync(
      join(dir, "panel-upgrade.mdx"),
      `---\ntitle: Panel Upgrade\ndate: 2026-09-01\nsummary: Replaced the main panel.\n---\nBody text.`
    );
    writeFileSync(
      join(dir, "gfci-retrofit.mdx"),
      `---\ntitle: GFCI Retrofit\ndate: 2026-08-01\nsummary: Added GFCI protection.\n---\nBody text.`
    );
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns all projects sorted newest-first", () => {
    const projects = getProjects(dir);
    expect(projects).toHaveLength(2);
    expect(projects[0].slug).toBe("panel-upgrade");
    expect(projects[0].title).toBe("Panel Upgrade");
    expect(projects[1].slug).toBe("gfci-retrofit");
  });

  it("returns an empty array for an empty directory", () => {
    const emptyDir = mkdtempSync(join(tmpdir(), "empty-projects-"));
    expect(getProjects(emptyDir)).toEqual([]);
    rmSync(emptyDir, { recursive: true, force: true });
  });
});

describe("getProjectBySlug", () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "project-slug-"));
    writeFileSync(
      join(dir, "panel-upgrade.mdx"),
      `---\ntitle: Panel Upgrade\ndate: 2026-09-01\nsummary: Replaced the main panel.\n---\nBody text.`
    );
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns the matching project's meta and content", () => {
    const result = getProjectBySlug("panel-upgrade", dir);
    expect(result).not.toBeNull();
    expect(result?.meta.title).toBe("Panel Upgrade");
    expect(result?.content.trim()).toBe("Body text.");
  });

  it("returns null for a missing slug", () => {
    expect(getProjectBySlug("does-not-exist", dir)).toBeNull();
  });
});

describe("getMathProgress", () => {
  let filePath: string;

  beforeAll(() => {
    const dir = mkdtempSync(join(tmpdir(), "math-progress-"));
    filePath = join(dir, "math-progress.json");
    writeFileSync(
      filePath,
      JSON.stringify([
        { id: "01-arithmetic", title: "Arithmetic", percentComplete: 0, status: "not-started" },
        { id: "02-ratios", title: "Ratios", percentComplete: 50, status: "in-progress" },
      ])
    );
  });

  it("returns the parsed module progress list", () => {
    const progress = getMathProgress(filePath);
    expect(progress).toHaveLength(2);
    expect(progress[1].status).toBe("in-progress");
  });
});

describe("getNotebooks", () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "notebooks-"));
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "linear-equations-to-circuits.ipynb"),
      JSON.stringify({
        cells: [
          {
            cell_type: "markdown",
            source: ["# Linear Equations Applied to Parallel Circuits"],
          },
        ],
      })
    );
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns notebook metadata with title from the first markdown heading", () => {
    const notebooks = getNotebooks(dir);
    expect(notebooks).toHaveLength(1);
    expect(notebooks[0].slug).toBe("linear-equations-to-circuits");
    expect(notebooks[0].title).toBe(
      "Linear Equations Applied to Parallel Circuits"
    );
  });

  it("returns an empty array for an empty directory", () => {
    const emptyDir = mkdtempSync(join(tmpdir(), "empty-notebooks-"));
    expect(getNotebooks(emptyDir)).toEqual([]);
    rmSync(emptyDir, { recursive: true, force: true });
  });
});

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
