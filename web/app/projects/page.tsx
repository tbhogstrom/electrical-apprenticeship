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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {project.date}
              </p>
              <p className="mt-1">{project.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
