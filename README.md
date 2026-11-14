# Mools

Maling-it Tools: a collection of client-side developer tools (string utilities, converters and API testing helpers) built with SvelteKit 3, Svelte 5, Bootstrap and Halfmoon. Everything runs in the browser and the site is deployed to GitHub Pages under `/tools`.

## Development

```bash
bun install
bun run dev      # dev server on http://localhost:6969/tools/
bun run test     # unit tests for src/lib
bun run build    # static build into build/
bun run preview
```

## Adding a tool

1. Add an entry to `src/lib/tools.js`; the sidebar, home page, category pages and search pick it up automatically.
2. Create `src/routes/<category>/<slug>/+page.svelte`. Most tools only need `ToolPage` with a list of `{ label, transform }` actions.
3. Put the logic in `src/lib` and cover it with a Vitest test.
