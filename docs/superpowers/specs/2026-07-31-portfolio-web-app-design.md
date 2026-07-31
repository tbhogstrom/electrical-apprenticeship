# Portfolio Web App — Design

## Goal

Build a public web app that shows progress and timeline toward the NIETC
Inside Electrician apprenticeship application (spring/summer 2027), and
serves as a portfolio of the house electrical projects and math work
documented in this repo. This is additive to the existing repo
scaffold — see
[`2026-07-31-apprenticeship-prep-design.md`](2026-07-31-apprenticeship-prep-design.md)
for the underlying project structure this app draws from.

## Repo & visibility decisions

- **Single repo, one repo (Approach B from discussion):** the web app lives
  in a new `web/` folder inside the existing `~/electrical-apprenticeship`
  repo, alongside `math/`, `house/`, `projects/`, etc.
- **The GitHub repo is public, and all folders remain tracked as-is —
  including `math/`, `house/`, and `projects/`.** This was an explicit,
  informed decision: it was flagged twice that a public repo means real
  house circuit/panel data, photos, and any address information added to
  `house/` over time will be publicly visible and effectively
  permanent (scraping/caching means it doesn't fully go away even if the
  repo is later made private). The user confirmed proceeding with full
  public tracking both times. No `.gitignore`-based mitigation is applied.
- The deployed **site itself** (the actual pages Next.js renders) only
  shows a **curated content layer** (see below) — this is a content/UX
  choice for site quality, not a privacy boundary. The raw working files
  remain separately browsable in the public GitHub repo regardless.

## Site structure

Five sections, Next.js App Router:

1. **Home** — brief intro/bio snapshot, current status, links to the rest
2. **Timeline** — curated chronological narrative of the prep journey
   (distinct from the granular working checklist in `../../milestones.md`)
3. **Projects** — portfolio of house electrical work: one case-study page
   per project (photos, objective, code work, math applied, lessons
   learned), a public-friendly rendering of what `../../projects/template.md`
   captures
4. **Math** — visual progress across the 8 learning modules (module
   completion, competency coverage) plus embedded Jupyter notebooks
   demonstrating math work applied to trade examples (see below)
5. **About** — construction background, GC license, goals, why Inside
   Electrician

## Content & data architecture

```
web/
  app/                      – Next.js pages (App Router)
  content/
    timeline.mdx             – curated narrative milestones
    about.mdx
    projects/
      <project-slug>.mdx      – one curated case-study per house project
    math-progress.json        – aggregate stats per module (% complete,
                                 diagnostic status) — summary numbers only
    notebooks/
      <topic-slug>.ipynb       – worked-example notebooks (see below)
```

Content under `web/content/` is deliberately hand-authored/curated — it is
not auto-generated from `../../math/`, `../../house/`, or `../../projects/`.
You write a timeline entry, project case study, or notebook when it's
ready to show; this keeps the public site's quality and framing under your
control even though the underlying repo is fully public.

## Math demonstration: Jupyter notebooks

Rather than a timed interactive quiz tool, the math section demonstrates
qualification directly: notebooks that work through a math topic and then
apply the same technique to a trade example (e.g. solving a system of
equations, then using the same approach for a parallel-circuit current
split; quadratic formula, then a related trade calculation).

- Authored locally in Python (e.g. with `sympy`/`numpy` as needed),
  standard `.ipynb` format.
- Stored under `web/content/notebooks/`.
- Rendered in the `/math` page via **`react-ipynb-renderer`** (npm,
  actively maintained, supports MathJax/KaTeX for equation rendering) —
  no Python runtime needed in the Vercel build; the notebook JSON is
  rendered client-side/server-side as React components.
- Each notebook maps to one or more competency tags from
  `../../competencies.md`, same convention as the rest of the repo.

This replaces the earlier "interactive timed quiz" concept from initial
brainstorming — worked notebooks were chosen instead because they better
demonstrate applied qualification for a portfolio audience, rather than
a private practice-score signal.

## Tech stack & deployment

- Next.js (App Router), TypeScript, deployed to Vercel from the `web/`
  folder of this repo.
- MDX for timeline/project/about content.
- `react-ipynb-renderer` for notebook rendering.
- Progress visuals (module completion, competency coverage charts) built
  following the dataviz skill's guidance for clean, light/dark-aware
  charts.
- Public Vercel URL; public GitHub repo (as decided above).

## Out of scope

- No automated pipeline pulling live data from `math/`, `house/`, or
  `projects/` into the public site — all public content is hand-curated.
- No interactive timed quiz/test-taking feature (superseded by the
  notebook approach).
- Specific notebook topics, timeline copy, and project case-study text are
  not decided here — authored during use, same convention as the base
  project's "out of scope" section.
