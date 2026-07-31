# Portfolio Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the `web/` Next.js portfolio app inside the existing `~/electrical-apprenticeship` repo — Home, Timeline, Projects, Math (progress + notebooks), and About pages — per the approved design.

**Architecture:** Next.js 15 App Router + TypeScript + Tailwind, content-as-files under `web/content/` (MDX for prose, JSON for progress stats, `.ipynb` for math notebooks). A small `lib/content.ts` module does the only real logic (reading/parsing content files) and gets unit tests via Vitest; page components are otherwise thin server components that call into it. Deployed to Vercel from a public GitHub repo.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, `gray-matter` (frontmatter parsing), `next-mdx-remote/rsc` (MDX rendering), `react-ipynb-renderer` (notebook rendering), Vitest (unit tests), Vercel (hosting), GitHub (public repo).

## Global Constraints

- App lives at `~/electrical-apprenticeship/web/` — a subfolder of the existing repo, not a separate repo (per the design's Approach B decision).
- The GitHub repo backing this is **public**, and `math/`, `house/`, `projects/` stay tracked as-is — no `.gitignore` mitigation (explicit prior decision, documented in the design spec).
- All content under `web/content/` is hand-curated — no code should read from `../math/`, `../house/`, or `../projects/` (the private working folders) to generate public pages.
- No interactive quiz/timed-test feature — math demonstration is via Jupyter notebooks rendered through `react-ipynb-renderer`.
- Commit after each task with a descriptive message.

---

### Task 1: Scaffold the Next.js app

**Files:**
- Create: `web/` (via `create-next-app`)
- Modify: none

**Interfaces:**
- Produces: the base Next.js project (App Router, TypeScript, Tailwind) that every later task builds pages/components into.

- [ ] **Step 1: Scaffold with create-next-app**

Run from the repo root:

```bash
cd ~/electrical-apprenticeship
CI=true npx create-next-app@latest web \
  --typescript --eslint --tailwind --app --no-src-dir \
  --import-alias "@/*" --use-npm
```

- [ ] **Step 2: Remove any nested git repo**

`create-next-app` sometimes runs `git init` even inside an existing repo. Check and remove if present:

```bash
test -d ~/electrical-apprenticeship/web/.git && rm -rf ~/electrical-apprenticeship/web/.git
```

- [ ] **Step 3: Verify the scaffold builds**

```bash
cd ~/electrical-apprenticeship/web && npm run build
```

Expected: build completes successfully (default Next.js starter page).

- [ ] **Step 4: Commit**

```bash
cd ~/electrical-apprenticeship
git add web/
git commit -m "Scaffold Next.js portfolio app"
```

---

### Task 2: Content utilities (`lib/content.ts`) with unit tests

**Files:**
- Create: `web/lib/content.ts`
- Create: `web/lib/content.test.ts`
- Create: `web/vitest.config.ts`
- Modify: `web/package.json` (add `vitest`, `gray-matter`, `test` script)

**Interfaces:**
- Produces (consumed by Tasks 3-5):
  - `type ProjectMeta = { slug: string; title: string; date: string; summary: string }`
  - `getProjects(contentDir?: string): ProjectMeta[]` — sorted newest-first
  - `getProjectBySlug(slug: string, contentDir?: string): { meta: ProjectMeta; content: string } | null`
  - `type MathModuleProgress = { id: string; title: string; percentComplete: number; status: "not-started" | "in-progress" | "complete" }`
  - `getMathProgress(filePath?: string): MathModuleProgress[]`
  - `type NotebookMeta = { slug: string; title: string }`
  - `getNotebooks(notebooksDir?: string): NotebookMeta[]`

- [ ] **Step 1: Install dependencies**

```bash
cd ~/electrical-apprenticeship/web
npm install gray-matter next-mdx-remote
npm install -D vitest
```

- [ ] **Step 2: Write the failing tests**

Create `web/lib/content.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  getProjects,
  getProjectBySlug,
  getMathProgress,
  getNotebooks,
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
```

- [ ] **Step 3: Create `web/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 4: Add the `test` script**

In `web/package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 5: Run tests to verify they fail**

```bash
cd ~/electrical-apprenticeship/web && npm test
```

Expected: FAIL — `./content` module not found.

- [ ] **Step 6: Implement `web/lib/content.ts`**

```typescript
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, basename } from "path";
import matter from "gray-matter";

const DEFAULT_PROJECTS_DIR = join(process.cwd(), "content/projects");
const DEFAULT_MATH_PROGRESS_FILE = join(
  process.cwd(),
  "content/math-progress.json"
);
const DEFAULT_NOTEBOOKS_DIR = join(process.cwd(), "content/notebooks");

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
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
cd ~/electrical-apprenticeship/web && npm test
```

Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
cd ~/electrical-apprenticeship
git add web/lib web/vitest.config.ts web/package.json web/package-lock.json
git commit -m "Add content utilities with unit tests"
```

---

### Task 3: Home, About, and Timeline pages

**Files:**
- Create: `web/content/about.mdx`
- Create: `web/content/timeline.mdx`
- Create: `web/app/page.tsx` (Home)
- Create: `web/app/about/page.tsx`
- Create: `web/app/timeline/page.tsx`
- Create: `web/lib/mdx.tsx`

**Interfaces:**
- Consumes: none from Task 2 (these pages render static MDX files directly, not through `lib/content.ts`).
- Produces: `renderMdxFile(filePath: string): Promise<JSX.Element>` in `web/lib/mdx.tsx`, used by Task 4's project detail page as well.

- [ ] **Step 1: Create `web/lib/mdx.tsx`**

```tsx
import { readFileSync } from "fs";
import { MDXRemote } from "next-mdx-remote/rsc";

export function renderMdxFile(filePath: string) {
  const source = readFileSync(filePath, "utf-8");
  return <MDXRemote source={source} />;
}
```

- [ ] **Step 2: Create `web/content/about.mdx`**

```mdx
# About

_(Fill in: construction background, general contractor's license, limited
110V work experience, and why the goal is the NIETC Inside Electrician
apprenticeship. This page is meant to be read by someone evaluating the
application, so write it for that audience.)_
```

- [ ] **Step 3: Create `web/content/timeline.mdx`**

```mdx
# Timeline

A running account of the path toward applying to the NIETC Inside
Electrician apprenticeship in spring/summer 2027.

_(Add dated entries below as milestones happen — math diagnostics
completed, house assessment done, each house project finished, aptitude
test practice sprint, application submitted, etc. Keep each entry short:
what happened, and why it mattered.)_

## 2026-07-31 — Project started

Set up the repo: math learning path, house documentation framework, and
this portfolio site.
```

- [ ] **Step 4: Create `web/app/about/page.tsx`**

```tsx
import { join } from "path";
import { renderMdxFile } from "@/lib/mdx";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 prose">
      {renderMdxFile(join(process.cwd(), "content/about.mdx"))}
    </main>
  );
}
```

- [ ] **Step 5: Create `web/app/timeline/page.tsx`**

```tsx
import { join } from "path";
import { renderMdxFile } from "@/lib/mdx";

export default function TimelinePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 prose">
      {renderMdxFile(join(process.cwd(), "content/timeline.mdx"))}
    </main>
  );
}
```

- [ ] **Step 6: Replace `web/app/page.tsx` with the Home page**

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Electrical Apprenticeship Prep</h1>
      <p className="mt-4 text-lg">
        Preparing to apply to the NECA-IBEW Electrical Training Center
        (NIETC) Inside Electrician apprenticeship, via IBEW Local 48, in
        spring/summer 2027. This site tracks the math review, documents
        real house electrical projects, and shows the work along the way.
      </p>
      <nav className="mt-8 flex flex-col gap-2 text-lg">
        <Link className="underline" href="/timeline">
          Timeline
        </Link>
        <Link className="underline" href="/projects">
          Projects
        </Link>
        <Link className="underline" href="/math">
          Math
        </Link>
        <Link className="underline" href="/about">
          About
        </Link>
      </nav>
    </main>
  );
}
```

- [ ] **Step 7: Install the Tailwind typography plugin (used by the `prose` class)**

```bash
cd ~/electrical-apprenticeship/web
npm install -D @tailwindcss/typography
```

Add the plugin to `web/tailwind.config.ts`'s `plugins` array:

```typescript
plugins: [require("@tailwindcss/typography")],
```

- [ ] **Step 8: Verify the app builds and pages render**

```bash
cd ~/electrical-apprenticeship/web && npm run build
```

Expected: build succeeds, with `/`, `/about`, `/timeline` listed as routes.

- [ ] **Step 9: Commit**

```bash
cd ~/electrical-apprenticeship
git add web/
git commit -m "Add Home, About, and Timeline pages"
```

---

### Task 4: Projects list and case-study pages

**Files:**
- Create: `web/app/projects/page.tsx`
- Create: `web/app/projects/[slug]/page.tsx`
- Create: `web/content/projects/.gitkeep`

**Interfaces:**
- Consumes: `getProjects`, `getProjectBySlug`, `ProjectMeta` from `web/lib/content.ts` (Task 2); `renderMdxFile` is not reused here directly since project body needs the parsed `content` string from `getProjectBySlug`, rendered via `MDXRemote` inline.

- [ ] **Step 1: Create `web/content/projects/.gitkeep`**

Empty placeholder so the directory is tracked before any real project
write-ups exist:

```
```

- [ ] **Step 2: Create `web/app/projects/page.tsx`**

```tsx
import Link from "next/link";
import { getProjects } from "@/lib/content";

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Projects</h1>
      {projects.length === 0 ? (
        <p className="mt-4 text-lg">
          No projects published yet — the first one will appear here once
          the house assessment is complete and a project is written up.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-6">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link
                className="text-xl font-semibold underline"
                href={`/projects/${project.slug}`}
              >
                {project.title}
              </Link>
              <p className="text-sm text-gray-500">{project.date}</p>
              <p className="mt-1">{project.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Create `web/app/projects/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getProjectBySlug, getProjects } from "@/lib/content";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export default function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 prose">
      <h1>{project.meta.title}</h1>
      <p className="text-sm text-gray-500">{project.meta.date}</p>
      <MDXRemote source={project.content} />
    </main>
  );
}
```

- [ ] **Step 4: Verify the app builds**

```bash
cd ~/electrical-apprenticeship/web && npm run build
```

Expected: build succeeds, `/projects` and `/projects/[slug]` routes present.

- [ ] **Step 5: Commit**

```bash
cd ~/electrical-apprenticeship
git add web/
git commit -m "Add projects list and case-study pages"
```

---

### Task 5: Math page — progress chart and notebook rendering

**Files:**
- Create: `web/content/math-progress.json`
- Create: `web/content/notebooks/.gitkeep`
- Create: `web/components/ProgressBar.tsx`
- Create: `web/components/NotebookViewer.tsx`
- Create: `web/app/math/page.tsx`

**Interfaces:**
- Consumes: `getMathProgress`, `getNotebooks`, `MathModuleProgress`, `NotebookMeta` from `web/lib/content.ts` (Task 2).

- [ ] **Step 1: Create `web/content/math-progress.json`**

Seeded with the 8 real modules from the math learning path, all at their
actual current state (not started):

```json
[
  { "id": "00-diagnostic", "title": "Diagnostic", "percentComplete": 0, "status": "not-started" },
  { "id": "01-arithmetic-fractions-decimals-percents", "title": "Arithmetic: Fractions, Decimals, Percents", "percentComplete": 0, "status": "not-started" },
  { "id": "02-ratios-proportions-measurement", "title": "Ratios, Proportions, Measurement", "percentComplete": 0, "status": "not-started" },
  { "id": "03-pre-algebra", "title": "Pre-Algebra", "percentComplete": 0, "status": "not-started" },
  { "id": "04-algebra-1", "title": "Algebra 1", "percentComplete": 0, "status": "not-started" },
  { "id": "05-geometry-trig", "title": "Geometry & Right-Triangle Trig", "percentComplete": 0, "status": "not-started" },
  { "id": "06-algebra-2", "title": "Algebra 2", "percentComplete": 0, "status": "not-started" },
  { "id": "07-trade-math-bridge", "title": "Trade Math Bridge", "percentComplete": 0, "status": "not-started" }
]
```

- [ ] **Step 2: Create `web/content/notebooks/.gitkeep`**

Empty placeholder so the directory is tracked before any notebooks exist:

```
```

- [ ] **Step 3: Install `react-ipynb-renderer`**

```bash
cd ~/electrical-apprenticeship/web
npm install react-ipynb-renderer
```

- [ ] **Step 4: Create `web/components/ProgressBar.tsx`**

```tsx
import { MathModuleProgress } from "@/lib/content";

export function ProgressBar({ module }: { module: MathModuleProgress }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm">
        <span>{module.title}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {module.percentComplete}%
        </span>
      </div>
      <div className="mt-1 h-2 w-full rounded bg-gray-200 dark:bg-gray-700">
        <div
          className="h-2 rounded bg-blue-600 dark:bg-blue-500"
          style={{ width: `${module.percentComplete}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `web/components/NotebookViewer.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { IpynbRenderer } from "react-ipynb-renderer";
import "react-ipynb-renderer/dist/styles/monokai.css";

export function NotebookViewer({ slug }: { slug: string }) {
  const [notebook, setNotebook] = useState<object | null>(null);

  useEffect(() => {
    fetch(`/notebooks/${slug}.ipynb`)
      .then((res) => res.json())
      .then(setNotebook);
  }, [slug]);

  if (!notebook) return <p>Loading notebook…</p>;

  return <IpynbRenderer ipynb={notebook} />;
}
```

- [ ] **Step 6: Create `web/app/math/page.tsx`**

```tsx
import { getMathProgress, getNotebooks } from "@/lib/content";
import { ProgressBar } from "@/components/ProgressBar";
import { NotebookViewer } from "@/components/NotebookViewer";

export default function MathPage() {
  const modules = getMathProgress();
  const notebooks = getNotebooks();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Math</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Progress</h2>
        <div className="mt-4">
          {modules.map((module) => (
            <ProgressBar key={module.id} module={module} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Worked Examples</h2>
        {notebooks.length === 0 ? (
          <p className="mt-4">
            No notebooks published yet — worked examples applying math to
            trade problems will appear here.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-12">
            {notebooks.map((notebook) => (
              <div key={notebook.slug}>
                <h3 className="text-lg font-semibold">{notebook.title}</h3>
                <NotebookViewer slug={notebook.slug} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 7: Make notebooks fetchable as static files**

`NotebookViewer` fetches `/notebooks/<slug>.ipynb` at runtime, so notebook
files need to be served from Next.js's `public/` directory in addition to
living in `content/notebooks/` (which is what `getNotebooks()` reads for
metadata at build time). Create the public directory now:

```bash
mkdir -p ~/electrical-apprenticeship/web/public/notebooks
touch ~/electrical-apprenticeship/web/public/notebooks/.gitkeep
```

Add this comment at the top of `web/app/math/page.tsx`, above the
imports, so the duplication requirement isn't a surprise later:

```tsx
// NOTE: when adding a notebook, place the .ipynb file in BOTH
// content/notebooks/ (read by getNotebooks() for metadata) and
// public/notebooks/ (served statically for NotebookViewer's fetch).
```

- [ ] **Step 8: Verify the app builds**

```bash
cd ~/electrical-apprenticeship/web && npm run build
```

Expected: build succeeds, `/math` route present.

- [ ] **Step 9: Commit**

```bash
cd ~/electrical-apprenticeship
git add web/
git commit -m "Add math page with progress chart and notebook rendering"
```

---

### Task 6: Shared navigation and layout polish

**Files:**
- Create: `web/components/NavBar.tsx`
- Modify: `web/app/layout.tsx`

**Interfaces:**
- Consumes: nothing new — links to routes created in Tasks 3-5.

- [ ] **Step 1: Create `web/components/NavBar.tsx`**

```tsx
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/timeline", label: "Timeline" },
  { href: "/projects", label: "Projects" },
  { href: "/math", label: "Math" },
  { href: "/about", label: "About" },
];

export function NavBar() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto flex max-w-2xl gap-6 px-4 py-4">
        {links.map((link) => (
          <Link key={link.href} className="underline" href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Wire `NavBar` into `web/app/layout.tsx`**

Read the existing `web/app/layout.tsx` first, then add the import and
render `<NavBar />` as the first child inside `<body>`, before
`{children}`:

```tsx
import { NavBar } from "@/components/NavBar";
```

```tsx
<body className={inter.className}>
  <NavBar />
  {children}
</body>
```

- [ ] **Step 3: Verify the app builds**

```bash
cd ~/electrical-apprenticeship/web && npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
cd ~/electrical-apprenticeship
git add web/
git commit -m "Add shared navigation"
```

---

### Task 7: Push to a public GitHub repo and deploy to Vercel

**Files:**
- None created — deployment/configuration only.

**Interfaces:**
- Consumes: the complete `web/` app from Tasks 1-6, plus the existing `math/`, `house/`, `projects/`, `reference/` folders already committed in earlier work.

- [ ] **Step 1: Confirm the GitHub destination with the user before creating anything**

Ask which GitHub account/org and repo name to use (e.g.
`electrical-apprenticeship`) before running any `gh repo create` command —
do not guess a destination for a public repo.

- [ ] **Step 2: Create the public GitHub repo and push**

```bash
cd ~/electrical-apprenticeship
gh repo create <owner>/<repo-name> --public --source=. --remote=origin
git push -u origin main
```

- [ ] **Step 3: Authenticate Vercel if not already**

Use the Vercel MCP tools (`authenticate` / `complete_authentication`) or
`vercel login` if working from the CLI directly.

- [ ] **Step 4: Link and deploy the `web/` directory to Vercel**

```bash
cd ~/electrical-apprenticeship/web
vercel link
vercel --prod
```

Confirm the project root is set to `web/` when prompted (not the repo
root), since that's where `package.json` lives.

- [ ] **Step 5: Verify the deployment**

Visit the returned production URL and confirm Home, Timeline, Projects,
Math, and About pages all load without errors.

- [ ] **Step 6: Record the live URL**

Add the production URL to the top of `web/README.md` (create this file if
it doesn't exist) so it's easy to find later:

```markdown
# Portfolio Web App

Live at: <production-url>

Next.js app for the electrical apprenticeship portfolio/progress site.
See `../docs/superpowers/specs/2026-07-31-portfolio-web-app-design.md`
for the design.
```

```bash
cd ~/electrical-apprenticeship
git add web/README.md
git commit -m "Record live deployment URL"
```
