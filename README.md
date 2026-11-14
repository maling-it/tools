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

## Agent support

Mools is built to be used by AI agents as well as people:

- **`/llms.txt`**, **`/tools.json`** and **`/sitemap.xml`** are generated from `src/lib/tools.js` at build time. `tools.json` also lists the JSON Schema of every callable tool.
- **WebMCP**: in browsers that support `navigator.modelContext`, every tool in `src/lib/agentTools.js` is registered on each page, so in-browser agents can call them directly.
- **MCP server**: `bun run mcp` starts a stdio MCP server (`mcp/server.js`) with the same tools, except the few that need a browser DOM. Example client config:

  ```json
  { "mcpServers": { "mools": { "command": "node", "args": ["/path/to/tools/mcp/server.js"] } } }
  ```

- Pages use labeled form fields and `SoftwareApplication` JSON-LD, so browser agents can also drive the UI.

To expose a new tool to agents, add an entry to `src/lib/agentTools.js` (name, description, JSON Schema, `run`).
