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
