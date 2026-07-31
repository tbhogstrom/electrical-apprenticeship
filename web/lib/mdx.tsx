import { readFileSync } from "fs";
import { MDXRemote } from "next-mdx-remote/rsc";

export function renderMdxFile(filePath: string) {
  const source = readFileSync(filePath, "utf-8");
  return <MDXRemote source={source} />;
}
