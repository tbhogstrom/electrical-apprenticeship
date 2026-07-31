// NOTE: when adding a notebook, place the .ipynb file in BOTH
// content/notebooks/ (read by getNotebooks() for metadata) and
// public/notebooks/ (served statically for NotebookViewer's fetch).
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
