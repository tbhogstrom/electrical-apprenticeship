import { readFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";
import matter from "gray-matter";

const DEFAULT_PROJECTS_DIR = join(process.cwd(), "content/projects");
const DEFAULT_MATH_PROGRESS_FILE = join(
  process.cwd(),
  "content/math-progress.json"
);
const DEFAULT_NOTEBOOKS_DIR = join(process.cwd(), "content/notebooks");
const DEFAULT_GALLERY_FILE = join(process.cwd(), "content/gallery.json");

export type ProjectMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
};

export function getProjects(
  contentDir: string = DEFAULT_PROJECTS_DIR
): ProjectMeta[] {
  if (!existsSync(contentDir)) return [];

  const files = readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  const projects = files.map((file) => {
    const slug = basename(file, ".mdx");
    const raw = readFileSync(join(contentDir, file), "utf-8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title as string,
      date: data.date as string,
      summary: data.summary as string,
    };
  });

  return projects.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getProjectBySlug(
  slug: string,
  contentDir: string = DEFAULT_PROJECTS_DIR
): { meta: ProjectMeta; content: string } | null {
  const filePath = join(contentDir, `${slug}.mdx`);
  if (!existsSync(filePath)) return null;

  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    meta: {
      slug,
      title: data.title as string,
      date: data.date as string,
      summary: data.summary as string,
    },
    content,
  };
}

export type MathModuleProgress = {
  id: string;
  title: string;
  percentComplete: number;
  status: "not-started" | "in-progress" | "complete";
};

export function getMathProgress(
  filePath: string = DEFAULT_MATH_PROGRESS_FILE
): MathModuleProgress[] {
  if (!existsSync(filePath)) return [];
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as MathModuleProgress[];
}

export type NotebookMeta = {
  slug: string;
  title: string;
};

export function getNotebooks(
  notebooksDir: string = DEFAULT_NOTEBOOKS_DIR
): NotebookMeta[] {
  if (!existsSync(notebooksDir)) return [];

  const files = readdirSync(notebooksDir).filter((f) =>
    f.endsWith(".ipynb")
  );

  return files.map((file) => {
    const slug = basename(file, ".ipynb");
    const raw = readFileSync(join(notebooksDir, file), "utf-8");
    const notebook = JSON.parse(raw);

    const firstMarkdownCell = notebook.cells?.find(
      (cell: { cell_type: string }) => cell.cell_type === "markdown"
    );
    const sourceLines: string[] = firstMarkdownCell?.source ?? [];
    const headingLine = sourceLines.find((line) => line.startsWith("#"));
    const title = headingLine
      ? headingLine.replace(/^#+\s*/, "").trim()
      : slug;

    return { slug, title };
  });
}

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
