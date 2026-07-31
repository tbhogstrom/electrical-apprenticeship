import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getProjectBySlug, getProjects } from "@/lib/content";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 prose dark:prose-invert">
      <h1>{project.meta.title}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {project.meta.date}
      </p>
      <MDXRemote source={project.content} />
    </main>
  );
}
