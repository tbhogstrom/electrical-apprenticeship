# Apprenticeship Prep Project Scaffold — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full `~/electrical-apprenticeship/` repo — top-level tracking files, the math learning path, the house documentation framework, the project template, and reference notes — per the approved design.

**Architecture:** This is a documentation/knowledge-base project, not application code. There is no logic to unit test. Each task creates a set of markdown files with real structural/instructional content (headers, checklists, competency tags, logging templates) — never fake placeholder text. "Testing" a task means verifying the files and directories exist with the right structure (via `find`/`ls`) and contain their required sections (via `grep`), then committing.

**Tech Stack:** Plain markdown files in a git repository. No build tooling, no scripts, no dependencies.

## Global Constraints

- Repo root: `~/electrical-apprenticeship/` (already `git init`'d, first commit is the design spec at `docs/superpowers/specs/2026-07-31-apprenticeship-prep-design.md`).
- No actual math practice problems, diagnostic test questions, or homeowner-goals-interview answers are authored as part of this plan — per the design's "Out of scope" section, that content is filled in during use, not decided upfront. Files provide structure/instructions/logging templates only.
- Every markdown file that represents a trackable unit of work (module notes, house assessment docs, projects) must reference applicable tags from `competencies.md` using the exact tag strings defined there — no inventing new tag spellings later without adding them to `competencies.md` first.
- Commit after each task with a descriptive message; do not batch all tasks into one commit.

---

### Task 1: Top-level tracking files

**Files:**
- Create: `README.md`
- Create: `milestones.md`
- Create: `competencies.md`

**Interfaces:**
- Produces: the exact competency tag strings every later task's files must reuse verbatim: `math.arithmetic.fractions-decimals-percents`, `math.ratios.proportions-measurement`, `math.pre-algebra.signed-numbers-equations`, `math.algebra1.linear-equations-systems`, `math.algebra1.exponents-polynomials`, `math.geometry.right-triangle-trig`, `math.algebra2.quadratics`, `math.algebra2.radicals-rationals`, `math.algebra2.functions`, `trade.load-calc`, `trade.grounding-bonding`, `trade.voltage-drop`, `trade.conduit-fill`, `trade.box-fill`, `trade.ohms-law-power`, `trade.series-parallel-circuits`, `trade.scope-and-client-intake`.

- [ ] **Step 1: Create `README.md`**

```markdown
# Electrical Apprenticeship Prep

Preparing to apply to the NECA-IBEW Electrical Training Center (NIETC)
**Inside Electrician** apprenticeship, via IBEW Local 48, in spring/summer
2027.

See [`docs/superpowers/specs/2026-07-31-apprenticeship-prep-design.md`](docs/superpowers/specs/2026-07-31-apprenticeship-prep-design.md)
for the full design.

## Layout

- [`milestones.md`](milestones.md) — timeline to the spring/summer 2027 application
- [`competencies.md`](competencies.md) — tag vocabulary used by math modules and house projects
- [`math/`](math/) — K-12 → Algebra 2 review + trade-math bridge
- [`house/`](house/) — baseline assessment, living circuit log, code/permit reference
- [`projects/`](projects/) — individual house electrical projects, apprentice-aligned
- [`reference/`](reference/) — notes on the IBEW48/NIETC program itself, prep resources

## Status

_Last updated: 2026-07-31_

- [ ] Math diagnostics complete (all domains)
- [ ] House assessment (Project 0) complete
- [ ] First safety-critical house project complete
- [ ] Trade-math bridge capstone (timed aptitude-test-format practice) complete
- [ ] NIETC application window identified and applied
```

- [ ] **Step 2: Create `milestones.md`**

```markdown
# Milestones

Target: submit NIETC Inside Electrician application in spring/summer 2027.

## Aug–Sep 2026
- [ ] Run math diagnostics across all domains (`math/00-diagnostic/`)
- [ ] Complete house assessment: panel schedule, circuit inventory,
      code-gap survey, homeowner-goals interview (`house/assessment/`)

## Oct 2026–Jan 2027
- [ ] Work math modules where diagnostics found gaps
- [ ] Complete first 1-3 house projects, safety-critical items first
      (grounding/bonding, GFCI/AFCI, panel capacity, knob-and-tube)

## Feb–Apr 2027
- [ ] Start watching NIETC's "Current Application Openings" page
      (https://nietc.org) — openings are posted at least 30 days in advance
- [ ] Continue house projects, choosing for competency breadth

## Mar–May 2027
- [ ] Timed aptitude-test practice sprint: Algebra & Functions,
      33 questions / 46 minutes (`math/07-trade-math-bridge/`)
- [ ] Interview prep

## Spring/Summer 2027
- [ ] Submit NIETC application
- [ ] Sit aptitude test
- [ ] Interview
```

- [ ] **Step 3: Create `competencies.md`**

```markdown
# Competency Tags

Flat tag vocabulary referenced by math modules (`math/*/notes.md`) and
house projects (`projects/*/README.md`) to show which apprentice-relevant
skills each piece of work builds toward.

Add new tags here as they come up in real work — this list is not meant to
be exhaustively pre-populated.

## Math
- `math.arithmetic.fractions-decimals-percents`
- `math.ratios.proportions-measurement`
- `math.pre-algebra.signed-numbers-equations`
- `math.algebra1.linear-equations-systems`
- `math.algebra1.exponents-polynomials`
- `math.geometry.right-triangle-trig`
- `math.algebra2.quadratics`
- `math.algebra2.radicals-rationals`
- `math.algebra2.functions`

## Trade
- `trade.load-calc`
- `trade.grounding-bonding`
- `trade.voltage-drop`
- `trade.conduit-fill`
- `trade.box-fill`
- `trade.ohms-law-power`
- `trade.series-parallel-circuits`
- `trade.scope-and-client-intake`

## Code
_(populate with specific NEC/Oregon amendment sections as they're
encountered in real house work — e.g. `code.nec-210-branch-circuits`,
`code.nec-250-grounding`)_
```

- [ ] **Step 4: Verify**

Run: `ls ~/electrical-apprenticeship/*.md`
Expected: `README.md`, `competencies.md`, `milestones.md` listed.

- [ ] **Step 5: Commit**

```bash
cd ~/electrical-apprenticeship
git add README.md milestones.md competencies.md
git commit -m "Add top-level tracking files"
```

---

### Task 2: `math/` top-level and diagnostic module

**Files:**
- Create: `math/README.md`
- Create: `math/00-diagnostic/README.md`
- Create: `math/00-diagnostic/results-log.md`

**Interfaces:**
- Consumes: nothing from Task 1 directly (competency tags are referenced by name only, no code linkage).
- Produces: the `math/00-diagnostic/results-log.md` table format, which Tasks 3-4 reference when describing "check the diagnostic result before starting a module."

- [ ] **Step 1: Create `math/README.md`**

```markdown
# Math Learning Path

Diagnostic-first review from K-12 arithmetic through Algebra 2, aimed at
the NIETC Inside Electrician aptitude test (Algebra & Functions,
33 questions / 46 minutes) and at real trade-math use in house projects.

Run the diagnostic in `00-diagnostic/` first. Only go deep into a numbered
module if the diagnostic shows a gap there — this is a review, not a
full re-run of K-12 math. A college physics background covers a lot of the
conceptual load in `07-trade-math-bridge/` already.

## Modules

1. `00-diagnostic/` — screening test per domain, run first
2. `01-arithmetic-fractions-decimals-percents/`
3. `02-ratios-proportions-measurement/` — unit conversion, big in trade math
4. `03-pre-algebra/` — signed numbers, order of operations, basic equations
5. `04-algebra-1/` — linear equations, systems, exponents, polynomials
6. `05-geometry-trig/` — right-triangle trig, used directly for conduit
   bending/offsets
7. `06-algebra-2/` — quadratics, radicals/rationals, functions
8. `07-trade-math-bridge/` — Ohm's law & power formulas, series/parallel
   circuit math, conduit fill %, box fill, voltage drop; ends with timed
   aptitude-test-format practice sets (the capstone before application
   season)

Each module folder (01-07) contains `notes.md`, `practice-problems.md`,
and `progress-log.md`.
```

- [ ] **Step 2: Create `math/00-diagnostic/README.md`**

```markdown
# Diagnostic

Purpose: find out which of the 7 domains below actually need review time,
before spending study time on things that are already solid.

## How to run it

For each domain, take a short (15-25 question) placement-style quiz
covering that domain only. Sources to pull from: Khan Academy's
per-topic practice sets, or the NJATC/NCCER Tech Math placement material
referenced in `../../reference/resources.md`. Time yourself loosely, but
this pass is about accuracy, not speed — speed work happens later in
`07-trade-math-bridge/`.

## Domains to screen

1. Arithmetic: fractions, decimals, percents
2. Ratios, proportions, measurement/unit conversion
3. Pre-algebra: signed numbers, order of operations, basic equations
4. Algebra 1: linear equations/systems, exponents, polynomials
5. Geometry & right-triangle trig
6. Algebra 2: quadratics, radicals/rationals, functions
7. Trade math: Ohm's law/power formulas, series/parallel circuits,
   conduit fill, box fill, voltage drop

Log every result in `results-log.md`, then go straight to the matching
numbered module folder for anything below your own "solid" bar.
```

- [ ] **Step 3: Create `math/00-diagnostic/results-log.md`**

```markdown
# Diagnostic Results Log

| Date | Domain | Score | Solid? (y/n) | Notes / gap areas |
|------|--------|-------|--------------|--------------------|
|      |        |       |              |                    |
```

- [ ] **Step 4: Verify**

Run: `find ~/electrical-apprenticeship/math -type f`
Expected: `math/README.md`, `math/00-diagnostic/README.md`,
`math/00-diagnostic/results-log.md` listed.

- [ ] **Step 5: Commit**

```bash
cd ~/electrical-apprenticeship
git add math/README.md math/00-diagnostic/
git commit -m "Add math/ overview and diagnostic module"
```

---

### Task 3: Math modules 01-04 (arithmetic through Algebra 1)

**Files:**
- Create: `math/01-arithmetic-fractions-decimals-percents/notes.md`
- Create: `math/01-arithmetic-fractions-decimals-percents/practice-problems.md`
- Create: `math/01-arithmetic-fractions-decimals-percents/progress-log.md`
- Create: `math/02-ratios-proportions-measurement/notes.md`
- Create: `math/02-ratios-proportions-measurement/practice-problems.md`
- Create: `math/02-ratios-proportions-measurement/progress-log.md`
- Create: `math/03-pre-algebra/notes.md`
- Create: `math/03-pre-algebra/practice-problems.md`
- Create: `math/03-pre-algebra/progress-log.md`
- Create: `math/04-algebra-1/notes.md`
- Create: `math/04-algebra-1/practice-problems.md`
- Create: `math/04-algebra-1/progress-log.md`

**Interfaces:**
- Consumes: competency tag strings from Task 1's `competencies.md`.
- Produces: the per-module 3-file pattern (`notes.md` / `practice-problems.md` / `progress-log.md`) that Task 4 repeats for modules 05-07.

- [ ] **Step 1: Create `math/01-arithmetic-fractions-decimals-percents/notes.md`**

```markdown
# Arithmetic: Fractions, Decimals, Percents

**Competency tags:** `math.arithmetic.fractions-decimals-percents`

## Subtopics
- [ ] Fraction operations (add, subtract, multiply, divide, simplify)
- [ ] Decimal operations and decimal/fraction conversion
- [ ] Percent problems (percent of, percent change, percent as decimal/fraction)
- [ ] Order of operations with mixed fractions/decimals

## Notes
_(add worked examples and rules-of-thumb here as you review)_
```

- [ ] **Step 2: Create `math/01-arithmetic-fractions-decimals-percents/practice-problems.md`**

```markdown
# Practice Problems

Log each practice set you work — source, date, score. Do not skip logging
a low score; that's exactly the signal `progress-log.md` needs.

| Date | Source | # Problems | Score | Topics missed |
|------|--------|------------|-------|----------------|
|      |        |            |       |                |
```

- [ ] **Step 3: Create `math/01-arithmetic-fractions-decimals-percents/progress-log.md`**

```markdown
# Progress Log

| Date | Time spent | What I worked on | Still shaky on |
|------|------------|-------------------|------------------|
|      |            |                   |                  |
```

- [ ] **Step 4: Create `math/02-ratios-proportions-measurement/notes.md`**

```markdown
# Ratios, Proportions, Measurement

**Competency tags:** `math.ratios.proportions-measurement`

## Subtopics
- [ ] Ratios and rates
- [ ] Proportions and cross-multiplication
- [ ] Unit conversion (imperial and metric)
- [ ] Dimensional analysis (chaining unit conversions)

## Notes
_(add worked examples and rules-of-thumb here as you review)_
```

- [ ] **Step 5: Create `math/02-ratios-proportions-measurement/practice-problems.md`**

```markdown
# Practice Problems

| Date | Source | # Problems | Score | Topics missed |
|------|--------|------------|-------|----------------|
|      |        |            |       |                |
```

- [ ] **Step 6: Create `math/02-ratios-proportions-measurement/progress-log.md`**

```markdown
# Progress Log

| Date | Time spent | What I worked on | Still shaky on |
|------|------------|-------------------|------------------|
|      |            |                   |                  |
```

- [ ] **Step 7: Create `math/03-pre-algebra/notes.md`**

```markdown
# Pre-Algebra

**Competency tags:** `math.pre-algebra.signed-numbers-equations`

## Subtopics
- [ ] Signed number operations (add, subtract, multiply, divide negatives)
- [ ] Order of operations (PEMDAS) with signed numbers
- [ ] Evaluating algebraic expressions
- [ ] Solving one-step and two-step equations

## Notes
_(add worked examples and rules-of-thumb here as you review)_
```

- [ ] **Step 8: Create `math/03-pre-algebra/practice-problems.md`**

```markdown
# Practice Problems

| Date | Source | # Problems | Score | Topics missed |
|------|--------|------------|-------|----------------|
|      |        |            |       |                |
```

- [ ] **Step 9: Create `math/03-pre-algebra/progress-log.md`**

```markdown
# Progress Log

| Date | Time spent | What I worked on | Still shaky on |
|------|------------|-------------------|------------------|
|      |            |                   |                  |
```

- [ ] **Step 10: Create `math/04-algebra-1/notes.md`**

```markdown
# Algebra 1

**Competency tags:** `math.algebra1.linear-equations-systems`, `math.algebra1.exponents-polynomials`

## Subtopics
- [ ] Linear equations and inequalities
- [ ] Systems of linear equations (substitution, elimination)
- [ ] Exponent rules
- [ ] Polynomial operations (add, subtract, multiply, factor)

## Notes
_(add worked examples and rules-of-thumb here as you review)_
```

- [ ] **Step 11: Create `math/04-algebra-1/practice-problems.md`**

```markdown
# Practice Problems

| Date | Source | # Problems | Score | Topics missed |
|------|--------|------------|-------|----------------|
|      |        |            |       |                |
```

- [ ] **Step 12: Create `math/04-algebra-1/progress-log.md`**

```markdown
# Progress Log

| Date | Time spent | What I worked on | Still shaky on |
|------|------------|-------------------|------------------|
|      |            |                   |                  |
```

- [ ] **Step 13: Verify**

Run: `find ~/electrical-apprenticeship/math -mindepth 2 -type f | sort`
Expected: 12 files, 3 each under `01-arithmetic-fractions-decimals-percents/`,
`02-ratios-proportions-measurement/`, `03-pre-algebra/`, `04-algebra-1/`.

- [ ] **Step 14: Commit**

```bash
cd ~/electrical-apprenticeship
git add math/01-arithmetic-fractions-decimals-percents math/02-ratios-proportions-measurement math/03-pre-algebra math/04-algebra-1
git commit -m "Add math modules 01-04 (arithmetic through Algebra 1)"
```

---

### Task 4: Math modules 05-07 (geometry/trig through trade-math bridge)

**Files:**
- Create: `math/05-geometry-trig/notes.md`
- Create: `math/05-geometry-trig/practice-problems.md`
- Create: `math/05-geometry-trig/progress-log.md`
- Create: `math/06-algebra-2/notes.md`
- Create: `math/06-algebra-2/practice-problems.md`
- Create: `math/06-algebra-2/progress-log.md`
- Create: `math/07-trade-math-bridge/notes.md`
- Create: `math/07-trade-math-bridge/practice-problems.md`
- Create: `math/07-trade-math-bridge/progress-log.md`
- Create: `math/07-trade-math-bridge/timed-practice-log.md`

**Interfaces:**
- Consumes: the same 3-file module pattern established in Task 3; competency tags from `competencies.md`.
- Produces: `math/07-trade-math-bridge/timed-practice-log.md`, which `milestones.md`'s "Mar–May 2027" line and `projects/template.md` (Task 6) refer to when a project step involves a calculation type covered there.

- [ ] **Step 1: Create `math/05-geometry-trig/notes.md`**

```markdown
# Geometry & Right-Triangle Trig

**Competency tags:** `math.geometry.right-triangle-trig`

## Subtopics
- [ ] Perimeter, area, volume
- [ ] Pythagorean theorem
- [ ] Right-triangle trig: sine, cosine, tangent
- [ ] Angle geometry as used for conduit bending (offsets, saddles, kicks)

## Notes
_(add worked examples and rules-of-thumb here as you review — this is the
module with the most direct hands-on payoff, since offset/saddle bending
angles are just right-triangle trig)_
```

- [ ] **Step 2: Create `math/05-geometry-trig/practice-problems.md`**

```markdown
# Practice Problems

| Date | Source | # Problems | Score | Topics missed |
|------|--------|------------|-------|----------------|
|      |        |            |       |                |
```

- [ ] **Step 3: Create `math/05-geometry-trig/progress-log.md`**

```markdown
# Progress Log

| Date | Time spent | What I worked on | Still shaky on |
|------|------------|-------------------|------------------|
|      |            |                   |                  |
```

- [ ] **Step 4: Create `math/06-algebra-2/notes.md`**

```markdown
# Algebra 2

**Competency tags:** `math.algebra2.quadratics`, `math.algebra2.radicals-rationals`, `math.algebra2.functions`

## Subtopics
- [ ] Quadratic equations (factoring, completing the square, quadratic formula)
- [ ] Radical expressions and operations
- [ ] Rational expressions and equations
- [ ] Function notation, evaluation, and graphing basics

## Notes
_(add worked examples and rules-of-thumb here as you review)_
```

- [ ] **Step 5: Create `math/06-algebra-2/practice-problems.md`**

```markdown
# Practice Problems

| Date | Source | # Problems | Score | Topics missed |
|------|--------|------------|-------|----------------|
|      |        |            |       |                |
```

- [ ] **Step 6: Create `math/06-algebra-2/progress-log.md`**

```markdown
# Progress Log

| Date | Time spent | What I worked on | Still shaky on |
|------|------------|-------------------|------------------|
|      |            |                   |                  |
```

- [ ] **Step 7: Create `math/07-trade-math-bridge/notes.md`**

```markdown
# Trade Math Bridge

**Competency tags:** `trade.ohms-law-power`, `trade.series-parallel-circuits`, `trade.conduit-fill`, `trade.box-fill`, `trade.voltage-drop`

This is where the college physics background should make things move fast
— these are the same circuit concepts (V=IR, P=IV) applied with trade
formulas and NEC tables instead of physics-textbook notation.

## Subtopics
- [ ] Ohm's law and power formulas (V=IR, P=IV, and derived forms)
- [ ] Series and parallel circuit calculations (resistance, current, voltage)
- [ ] Conduit fill percentage calculations (NEC Chapter 9 tables)
- [ ] Box fill calculations (NEC 314.16)
- [ ] Voltage drop calculations

## Notes
_(add worked examples and rules-of-thumb here as you review; link to
specific NEC table numbers as you use them, and add corresponding
`code.*` tags to `../../competencies.md` once you do)_
```

- [ ] **Step 8: Create `math/07-trade-math-bridge/practice-problems.md`**

```markdown
# Practice Problems

| Date | Source | # Problems | Score | Topics missed |
|------|--------|------------|-------|----------------|
|      |        |            |       |                |
```

- [ ] **Step 9: Create `math/07-trade-math-bridge/progress-log.md`**

```markdown
# Progress Log

| Date | Time spent | What I worked on | Still shaky on |
|------|------------|-------------------|------------------|
|      |            |                   |                  |
```

- [ ] **Step 10: Create `math/07-trade-math-bridge/timed-practice-log.md`**

```markdown
# Timed Practice Log (Aptitude Test Format)

Capstone before application season. The NIETC Inside Electrician aptitude
test's Algebra & Functions section is 33 questions in 46 minutes
(~84 seconds/question). Once the subtopics above feel solid, start running
practice sets under that exact time pressure and log results here.

| Date | # Questions | Time limit | Time taken | Score | Notes |
|------|-------------|------------|------------|-------|-------|
|      |             |            |            |       |       |
```

- [ ] **Step 11: Verify**

Run: `find ~/electrical-apprenticeship/math -mindepth 2 -type f | sort`
Expected: 22 files total across all of `math/00` through `math/07`
(3 diagnostic files not counted the same way — recount: 00 has 2 files,
01-06 have 3 each = 18, 07 has 4 = total 24 files under `math/*/`).

- [ ] **Step 12: Commit**

```bash
cd ~/electrical-apprenticeship
git add math/05-geometry-trig math/06-algebra-2 math/07-trade-math-bridge
git commit -m "Add math modules 05-07 (geometry/trig through trade-math bridge)"
```

---

### Task 5: `house/` documentation framework

**Files:**
- Create: `house/README.md`
- Create: `house/assessment/panel-schedule.md`
- Create: `house/assessment/circuit-inventory.md`
- Create: `house/assessment/code-gap-survey.md`
- Create: `house/assessment/homeowner-goals.md`
- Create: `house/assessment/photos/README.md`
- Create: `house/circuit-log.md`
- Create: `house/reference/README.md`
- Create: `house/reference/permits-process.md`

**Interfaces:**
- Consumes: `trade.load-calc`, `trade.grounding-bonding`, `trade.scope-and-client-intake` tags from `competencies.md` (Task 1).
- Produces: `house/circuit-log.md`'s table format, which `projects/template.md` (Task 6) instructs project authors to update whenever a project touches a circuit.

- [ ] **Step 1: Create `house/README.md`**

```markdown
# House

1923-built house. This folder holds the baseline assessment, the living
circuit log, and code/permit reference notes.

- [`assessment/`](assessment/) — Project 0: full panel schedule, circuit
  inventory, code-gap survey, and homeowner-goals interview. Run before
  any other house project.
- [`circuit-log.md`](circuit-log.md) — living master panel schedule/circuit
  directory. Update this every time any project touches a circuit.
- [`reference/`](reference/) — NEC + Oregon amendment notes, permit process.

## House basics
- Built: 1923
- Jurisdiction (city/county building dept): _fill in_
- Panel age/type: _fill in after assessment_
```

- [ ] **Step 2: Create `house/assessment/panel-schedule.md`**

```markdown
# Panel Schedule

**Competency tags:** `trade.load-calc`

Record every breaker/fuse position, what it feeds, wire gauge, and
condition. This is Project 0 — no live work, just inventory.

| Position | Breaker/fuse size | Circuit feeds | Wire gauge | Condition notes |
|----------|--------------------|----------------|------------|-------------------|
|          |                    |                |            |                   |

## Panel info
- Manufacturer/model:
- Rated capacity (amps):
- Main breaker/fuse size:
- Grounding electrode system observed:
- Date surveyed:
```

- [ ] **Step 3: Create `house/assessment/circuit-inventory.md`**

```markdown
# Circuit Inventory

**Competency tags:** `trade.load-calc`

Trace each circuit from the panel schedule out to every device/fixture it
feeds. This is the room-by-room companion to `panel-schedule.md`.

| Circuit (panel position) | Room/area | Devices/fixtures on this circuit | GFCI/AFCI present? | Notes |
|----------------------------|-----------|-------------------------------------|----------------------|-------|
|                             |           |                                     |                      |       |
```

- [ ] **Step 4: Create `house/assessment/code-gap-survey.md`**

```markdown
# Code Gap Survey

**Competency tags:** `trade.grounding-bonding`

Compare what's actually installed against current NEC + Oregon amendments
for a residence. This produces the safety-critical priority list that
drives project selection (see `../../projects/template.md`).

## Checklist
- [ ] Grounding/bonding: service ground, bonding jumpers, ground rod(s)
- [ ] GFCI protection: kitchen, bath, garage, exterior, unfinished basement
- [ ] AFCI protection: bedrooms and other required areas
- [ ] Knob-and-tube wiring present? Where?
- [ ] Panel capacity vs. actual/planned load
- [ ] Any double-tapped breakers or other panel defects
- [ ] Outdated devices (ungrounded outlets, cloth wiring, etc.)

## Findings log

| Date | Area | Gap found | Code reference | Severity (safety-critical / other) |
|------|------|-----------|------------------|--------------------------------------|
|      |      |           |                  |                                       |
```

- [ ] **Step 5: Create `house/assessment/homeowner-goals.md`**

```markdown
# Homeowner Goals

**Competency tags:** `trade.scope-and-client-intake`

A real scope of work isn't just "bring it to code" — it also accounts for
what the homeowner actually wants over the next few years. Treat this as
a client-intake interview with yourself, on record, dated.

## Interview

- Budget range for electrical work over the next 1-2 years:
- Known future plans (EV charging, kitchen/bath remodel, home office,
  workshop/shop power, etc.):
- Pain points noticed day-to-day (not enough outlets, breakers tripping,
  dim lights, etc.):
- Rooms/areas considered highest priority, and why:
- Anything explicitly out of scope or lower priority for now:

## How this feeds project selection

Cross-reference this list against `code-gap-survey.md` when prioritizing
`../../projects/`. A gap that's low-severity on the code survey but blocks
a real near-term plan (e.g. no circuit for a future EV charger) can
outrank a higher-severity gap that's easy to defer.
```

- [ ] **Step 6: Create `house/assessment/photos/README.md`**

```markdown
# Assessment Photos

Panel (overall + close-up of labels), each room's devices/fixtures, and
any code-gap findings (knob-and-tube, missing GFCI, damaged devices, etc.)
from the assessment. Name files `YYYY-MM-DD-<area>-<description>.jpg`.
```

- [ ] **Step 7: Create `house/circuit-log.md`**

```markdown
# Circuit Log

Living master record. Update this whenever any project (in `../projects/`)
adds, moves, or modifies a circuit — this should always reflect current
reality, not just the original assessment.

| Circuit (panel position) | Feeds | Wire gauge | Protection (GFCI/AFCI/none) | Last touched (date, project) |
|----------------------------|-------|------------|--------------------------------|----------------------------------|
|                             |       |            |                                 |                                   |

_Seed this table from `assessment/panel-schedule.md` and
`assessment/circuit-inventory.md` once the assessment is complete._
```

- [ ] **Step 8: Create `house/reference/README.md`**

```markdown
# House Reference

Code and permit notes specific to residential/older-home electrical work
in this jurisdiction. Add NEC section notes here as they come up in real
project work (and mirror the tag in `../../competencies.md` under `## Code`).

- [`permits-process.md`](permits-process.md) — how owner permits work in
  Oregon for this house
```

- [ ] **Step 9: Create `house/reference/permits-process.md`**

```markdown
# Owner Permit Process (Oregon)

Source: Oregon Building Codes Division and local jurisdiction permitting
pages (checked 2026-07-31) — verify against the specific city/county
building department for this house, since local process details vary.

## When a permit is NOT required
Per ORS 479.540, maintenance-only work on a residence you own does not
require a permit — e.g. like-for-like replacement of outlets, switches,
light fixtures, fuses, breakers, or light bulbs. This does **not** cover
new circuits or substantial alterations.

## When a homeowner CAN pull their own permit
For work that does require a permit, an owner can pull it themselves if:
- The property is a single-family house or duplex, and is the applicant's
  primary residence
- The property is not, and will not be, for sale/lease/rent
- The work is performed by the homeowner (or immediate family), not hired
  labor

## Process (general — confirm specifics with local jurisdiction)
1. Identify the correct building department (varies: city vs. county —
   confirm which covers this address).
2. Submit the electrical permit application as the homeowner, noting it's
   owner-performed work.
3. Pay permit fee, receive permit/inspection card.
4. Perform the work to code.
5. Schedule required inspection(s) — rough-in and/or final, depending on
   scope.
6. Address any correction notices, re-inspect if needed.
7. Receive final approval/sign-off.

## Per-project tracking
Each project in `../../projects/<name>/` logs its own permit number,
pull date, inspection date(s), and outcome in its `README.md` (see
`../../projects/template.md`).
```

- [ ] **Step 10: Verify**

Run: `find ~/electrical-apprenticeship/house -type f | sort`
Expected: 9 files across `house/README.md`, `house/circuit-log.md`,
`house/assessment/*.md` (4 files), `house/assessment/photos/README.md`,
`house/reference/*.md` (2 files).

- [ ] **Step 11: Commit**

```bash
cd ~/electrical-apprenticeship
git add house/
git commit -m "Add house/ documentation framework"
```

---

### Task 6: `projects/` template

**Files:**
- Create: `projects/template.md`

**Interfaces:**
- Consumes: `house/circuit-log.md` update instruction (Task 5), competency tags from `competencies.md` (Task 1), permit process from `house/reference/permits-process.md` (Task 5).
- Produces: the exact section structure every future `projects/<name>/README.md` should copy — this task does not create any example project folder, since the first real project only exists once the house assessment is done.

- [ ] **Step 1: Create `projects/template.md`**

```markdown
# Project Template

Copy this into a new `projects/YYYY-MM-<short-name>/README.md` for each
house electrical project. Fill in every section — an empty section is a
sign the project isn't scoped yet.

---

# <Project Name>

**Date started / completed:**
**Status:** planned / in progress / inspected / complete

## Objective
What this project does and why it was chosen now (reference
`../../house/assessment/code-gap-survey.md` and/or
`../../house/assessment/homeowner-goals.md`).

## Applicable code sections
List specific NEC articles/tables and any Oregon amendments that apply.
Add corresponding `code.*` tags to `../../competencies.md` if new.

## Math / calculations performed
Any load calc, voltage drop, conduit fill, or box fill calculations done
for this project. Reference the relevant `../../math/07-trade-math-bridge/`
notes.

## Permit
- Permit number:
- Pull date:
- Inspection date(s):
- Outcome (pass / corrections / fail — and what was corrected):

(See `../../house/reference/permits-process.md` for the general process.)

## Materials
List of materials/parts used.

## Before / after photos
Link or reference photo files for this project.

## Competency tags
List every tag from `../../competencies.md` this project builds toward.

## Lessons learned
What would an apprentice take away from this project? What went wrong,
what would you do differently next time?

## Circuit log update
Confirm `../../house/circuit-log.md` has been updated to reflect any
circuit added/moved/modified by this project.
```

- [ ] **Step 2: Verify**

Run: `test -f ~/electrical-apprenticeship/projects/template.md && echo exists`
Expected: `exists`

- [ ] **Step 3: Commit**

```bash
cd ~/electrical-apprenticeship
git add projects/template.md
git commit -m "Add project template"
```

---

### Task 7: `reference/` — program notes and study resources

**Files:**
- Create: `reference/ibew48-nietc-notes.md`
- Create: `reference/resources.md`

**Interfaces:**
- Consumes: program facts already gathered during design (IBEW48/NIETC research from 2026-07-31).
- Produces: nothing consumed by other tasks — this is a leaf reference folder.

- [ ] **Step 1: Create `reference/ibew48-nietc-notes.md`**

```markdown
# IBEW48 / NIETC Program Notes

Source: ibew48.com/apprenticeship and nietc.org (fetched 2026-07-31).
Re-verify before application season — details can change year to year.

## Programs offered (via NECA-IBEW Electrical Training Center / NIETC)
1. **Inside Electrician** — 5-year apprenticeship. **This is the target
   program.** Requires an aptitude test and an interview.
2. Limited Energy-A Technician — 3.5-year program, also requires the
   aptitude test.
3. Limited Residential Electrician — 2.5-year program, no aptitude test,
   but requires a full year of C-or-better math on transcript. Considered
   and ruled out in favor of Inside Electrician.

## Aptitude test (Inside Electrician / Limited Energy-A)
- Algebra & Functions section: 33 questions in 46 minutes.
- Prep target for `../math/07-trade-math-bridge/timed-practice-log.md`.

## Application process
- Roughly 2-3 months end-to-end: application → aptitude test → interview.
- Application openings are posted at least 30 days in advance on NIETC's
  "Current Application Openings" page (nietc.org). The specific
  spring/summer 2027 window is not yet known as of this writing — start
  watching in Feb 2027 per `../milestones.md`.

## Training structure
Combines classroom instruction and on-the-job training; prepares
apprentices for Oregon State Journeyman license exams (and Washington
equivalents where applicable).

## Contacts
- Portland: 503-256-4848
- Vancouver: 360-892-0171
- NECA-IBEW Electrical Training Center: 16021 NE Airport Way, Portland, OR
  97230 — 503-262-9991
- Applications/transcript review: applications@nietc.org

## Open questions to resolve before applying
- Confirm current minimum qualifications (age, education, work experience)
  for Inside Electrician specifically, directly with NIETC.
- Confirm whether prior construction experience, a GC license, or limited
  110V work experience factors into the interview/scoring.
```

- [ ] **Step 2: Create `reference/resources.md`**

```markdown
# Study & Prep Resources

## Math
- NJATC Tech Math course (via University of Tennessee) — self-paced,
  online, starts at whole numbers and works through Boolean algebra
  fundamentals. Referenced by NIETC as prep material.
- Khan Academy — free, per-topic practice sets, good for the diagnostic in
  `../math/00-diagnostic/` and for filling gaps in modules 01-06.

## Aptitude test prep
- Look for NJATC/IBEW aptitude test practice sets specifically formatted
  as Algebra & Functions timed sections, to match the real 33
  questions/46 minutes format used in `../math/07-trade-math-bridge/timed-practice-log.md`.

## Code reference
- NEC (National Electrical Code), current adopted edition per Oregon
  Building Codes Division.
- Oregon Administrative Rules, Chapter 918 (electrical) —
  oregon.public.law is a convenient searchable mirror.

## Program info
- nietc.org — program pages, FAQ, current application openings
- ibew48.com/apprenticeship — top-level program overview
```

- [ ] **Step 3: Verify**

Run: `find ~/electrical-apprenticeship/reference -type f`
Expected: `reference/ibew48-nietc-notes.md`, `reference/resources.md`.

- [ ] **Step 4: Commit**

```bash
cd ~/electrical-apprenticeship
git add reference/
git commit -m "Add IBEW48/NIETC program notes and study resources"
```

---

### Task 8: Final integration check

**Files:**
- None created — verification only.

**Interfaces:**
- Consumes: the full tree from Tasks 1-7.
- Produces: nothing further; this is the plan's final gate.

- [ ] **Step 1: Verify full tree**

Run: `find ~/electrical-apprenticeship -type f -not -path '*/.git/*' | sort`

Expected: every file listed across Tasks 1-7 (top-level 3 files; `math/`
= 25 files total, i.e. `math/README.md` plus 2 in `00-diagnostic/`, 3 each
in `01-` through `06-` (18), and 4 in `07-trade-math-bridge/`; `house/` = 9
files; `projects/template.md`; `reference/` = 2 files; plus
`docs/superpowers/specs/2026-07-31-apprenticeship-prep-design.md` and this
plan file under `docs/superpowers/plans/`).

- [ ] **Step 2: Verify git log shows one commit per task**

Run: `git -C ~/electrical-apprenticeship log --oneline`
Expected: 8 commits (design spec + Tasks 1-7 above), oldest to newest.

- [ ] **Step 3: Verify no stray uncommitted files**

Run: `git -C ~/electrical-apprenticeship status --porcelain`
Expected: empty output (this plan file itself gets committed as part of
kicking off execution — see the executing skill's own instructions).
