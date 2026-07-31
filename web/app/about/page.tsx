import { join } from "path";
import { renderMdxFile } from "@/lib/mdx";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 prose dark:prose-invert">
      {renderMdxFile(join(process.cwd(), "content/about.mdx"))}
    </main>
  );
}
