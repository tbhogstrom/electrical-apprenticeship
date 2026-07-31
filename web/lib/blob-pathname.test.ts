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
