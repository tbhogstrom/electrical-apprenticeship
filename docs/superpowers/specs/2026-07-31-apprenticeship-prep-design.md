# IBEW48/NIETC Inside Electrician Apprenticeship Prep — Design

## Goal

Apply to the NECA-IBEW Electrical Training Center (NIETC) **Inside Electrician**
apprenticeship (5-year program, via IBEW Local 48) in spring/summer 2027. The
applicant has construction experience, a general contractor's license, and
some limited 110V work, and wants to be a strong candidate — including being
ready to lead a truck for a residential electrician as soon as possible.

This project is the single place that houses:
1. A math learning path bringing K-12 math through Algebra 2 back up to
   speed, culminating in aptitude-test-format practice.
2. A framework for logging and documenting real electrical work on the
   applicant's 1923 house.
3. Selection and tracking of house projects chosen to build breadth aligned
   with first-year apprentice topics, not just to clear a punch list.

## Program facts that shape this design

Source: ibew48.com/apprenticeship and nietc.org (fetched 2026-07-31).

- Inside Electrician is a 5-year program requiring an **aptitude test**
  (Algebra & Functions section: 33 questions in 46 minutes) plus an
  interview. This is distinct from the Limited Residential Electrician
  track (2.5yr, no aptitude test), which was considered and ruled out in
  favor of Inside Electrician.
- Application process (application → aptitude test → interview) takes
  roughly 2-3 months once started.
- NIETC posts application openings at least 30 days in advance on their
  "Current Application Openings" page — the exact spring/summer 2027 window
  is not yet known and must be watched for starting ~Feb 2027.
- Math prep resources referenced by NJATC/NIETC include a self-paced Tech
  Math course (whole numbers through Boolean algebra fundamentals).

## Location & repo shape

Git-tracked folder at `~/electrical-apprenticeship/`, editable as plain
markdown, no app dependency required (though it can be opened in any
markdown-aware editor/viewer).

```
electrical-apprenticeship/
  README.md            – goals, target program, status snapshot
  milestones.md        – timeline from now to spring/summer 2027 application
  competencies.md       – tag vocabulary referenced by math modules & house projects
  math/                 – K-12 → Algebra 2 review + trade-math bridge
  house/                – baseline assessment, living circuit log, code/permit reference
  projects/             – individual apprentice-aligned project folders + template
  reference/             – notes on the IBEW48/NIETC program itself, prep resources
  docs/superpowers/specs/ – this design doc and any future revisions
```

### Competency tagging

`competencies.md` holds a flat list of tags such as:

- `math.algebra.linear-equations`, `math.geometry.right-triangle-trig`,
  `math.algebra2.quadratics`
- `trade.load-calc`, `trade.grounding-bonding`, `trade.voltage-drop`,
  `trade.conduit-fill`, `trade.scope-and-client-intake`
- `code.nec-210-branch-circuits`, `code.nec-250-grounding`, etc. (populated
  as real code sections come up in house work, not pre-populated
  exhaustively)

Both math modules and house projects list which tags they satisfy in their
own files. This is a lightweight cross-reference, not a separate database —
no tooling is required to keep it in sync, it's just a documented
convention.

## `math/` — learning path

Diagnostic-first: a short screening test per domain run before any deep
study, so study time goes to actual gaps rather than a fixed curriculum
re-run. The applicant has a college physics background, which substitutes
for a lot of the trade-math conceptual load (circuits, power, forces).

```
math/
  README.md
  00-diagnostic/
  01-arithmetic-fractions-decimals-percents/
  02-ratios-proportions-measurement/
  03-pre-algebra/
  04-algebra-1/
  05-geometry-trig/
  06-algebra-2/
  07-trade-math-bridge/
```

Each numbered module folder contains:
- `notes.md` — review notes, worked examples
- `practice-problems.md` — problem sets
- `progress-log.md` — dated log of study sessions and diagnostic results
- a competency-tag list at the top of `notes.md`

`05-geometry-trig` specifically covers right-triangle trig because it's
used directly for conduit bending/offsets, not just as an abstract
standards checkbox.

`07-trade-math-bridge` covers Ohm's law and power formulas, series/parallel
circuit math, conduit fill %, box fill, and voltage drop — and is where the
physics background pays off fastest. This module ends with timed practice
sets built to mimic the actual aptitude test format (33 questions / 46
minutes, Algebra & Functions), as the capstone before application season.

## `house/` — documentation framework

```
house/
  README.md                – build year, known systems, general status
  assessment/               – Project 0, run before any other house project
    panel-schedule.md
    circuit-inventory.md
    code-gap-survey.md
    homeowner-goals.md       – interview/case-study capturing priorities,
                                budget constraints, and future plans (e.g.
                                EV charging, kitchen/bath remodels, home
                                office) — not just code compliance
    photos/
  circuit-log.md            – living master panel schedule/circuit
                               directory, updated whenever any project
                               touches a circuit
  reference/                 – NEC + Oregon amendment notes relevant to
                               residential/older-home work, permit process
                               notes
```

The assessment is itself a legitimate apprentice-aligned exercise (circuit
tracing, load calc practice, code-gap identification against NEC) — its
output (a prioritized punch list, informed by both code gaps and homeowner
goals) is what feeds `projects/`.

`homeowner-goals.md` also earns its own competency tag
(`trade.scope-and-client-intake`) — reading homeowner intent into a scope
of work is a real apprentice/journeyman skill, not busywork.

## `projects/` — individual work

```
projects/
  template.md
  2026-XX-<name>/
```

`template.md` fields: objective, applicable NEC/Oregon code sections, math
or calculations performed (cross-referencing `math/07-trade-math-bridge`
where relevant), permit number, inspection outcome, before/after photos,
materials used, competency tags, lessons learned.

### Legal/safety approach

All house electrical work is done as **owner permits + inspection,
self-performed** — Oregon allows a homeowner to pull electrical permits for
work on their own primary residence. Each project folder tracks permit
pull date, inspection scheduling, and pass/fail/corrections as part of its
record.

### Selection logic

1. Project 0 is always the house assessment (no live electrical work,
   lowest risk, produces the prioritized punch list).
2. After that, prioritize safety-critical items first: grounding/bonding
   gaps, missing GFCI/AFCI protection, panel capacity issues, any
   knob-and-tube wiring found.
3. Beyond safety-critical items, deliberately choose projects for breadth
   against competency tags already covered — e.g. if recent projects have
   all been branch-circuit work, the next pick should touch feeders,
   subpanel work, or another under-represented area — so that by
   application time the project log shows a spread across major code areas
   and apprentice topics, not just whatever was cheapest or easiest.

## `milestones.md` — timeline

- **Aug–Sep 2026**: math diagnostics across all domains; house assessment
  (Project 0, including homeowner-goals interview)
- **Oct 2026–Jan 2027**: math modules where diagnostics found gaps, run in
  parallel with the first 1-3 house projects (safety-critical first)
- **Feb–Apr 2027**: watch NIETC's "Current Application Openings" page for
  the actual spring/summer 2027 application window (posted ~30 days in
  advance); continue house projects for breadth
- **Mar–May 2027**: timed aptitude-test practice sprint
  (Algebra & Functions format) + interview prep
- **Spring/Summer 2027**: submit application, sit aptitude test, interview

## Out of scope

- No app/tooling beyond plain markdown + git — no database, no
  competency-tracking script, no build process. The tagging convention is
  manual and documented, not enforced by code.
- No pre-population of every possible NEC code tag or trade-math topic —
  tags and reference notes are added as they're actually encountered,
  keeping the project from becoming a curriculum-transcription exercise.
- This spec does not include the specific content of math practice
  problems or the full homeowner-goals interview questions — those are
  filled in during implementation/use, not decided upfront.
