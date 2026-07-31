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
