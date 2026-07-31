"use client";

import { useEffect, useState } from "react";
import { Notebook } from "@jupyter-kit/react";
import { python } from "@jupyter-kit/core/langs/python";
import type { Ipynb } from "@jupyter-kit/core";
import { createKatexCdnPlugin } from "@jupyter-kit/katex-cdn";
import "@jupyter-kit/theme-default/default.css";
import "@jupyter-kit/theme-default/syntax/one-dark.css";

const katexPlugin = createKatexCdnPlugin();

export function NotebookViewer({ slug }: { slug: string }) {
  const [notebook, setNotebook] = useState<Ipynb | null>(null);

  useEffect(() => {
    fetch(`/notebooks/${slug}.ipynb`)
      .then((res) => res.json())
      .then(setNotebook);
  }, [slug]);

  if (!notebook) return <p>Loading notebook…</p>;

  return (
    <Notebook
      ipynb={notebook}
      language="python"
      languages={[python]}
      plugins={[katexPlugin]}
    />
  );
}
