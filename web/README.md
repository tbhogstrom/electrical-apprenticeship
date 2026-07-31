# Portfolio Web App

Live at: https://web-ruby-seven-18.vercel.app

Next.js app for the electrical apprenticeship portfolio/progress site.
See `../docs/superpowers/specs/2026-07-31-portfolio-web-app-design.md`
for the design.

## Development

```bash
nvm use   # picks up .nvmrc (Node 22)
npm run dev
npm test
npm run build
```

## Adding content

- Timeline: edit `content/timeline.mdx`
- About: edit `content/about.mdx`
- Projects: add a new `content/projects/<slug>.mdx` file with frontmatter
  (`title`, `date`, `summary`) — it will appear on `/projects` automatically
- Math progress: update `content/math-progress.json`
- Notebooks: add a `.ipynb` file to **both** `content/notebooks/` and
  `public/notebooks/`, then it will appear on `/math`
