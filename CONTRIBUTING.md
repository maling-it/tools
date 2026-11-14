# Contributing to Mools

Thank you for helping to make Mools better. Bug reports, tool requests, documentation fixes and pull requests are all welcome. By taking part you agree to follow the [Code of Conduct](.github/CODE_OF_CONDUCT.md).

## Ways to help

- **Report a bug.** Use the [bug report form](https://github.com/maling-it/tools/issues/new?template=bug_report.yml). Include the tool, what you entered and what you expected.
- **Suggest a tool.** Use the [tool request form](https://github.com/maling-it/tools/issues/new?template=tool_request.yml). Tools that run entirely in the browser are the easiest to add. There is also a [list of tool ideas](https://github.com/maling-it/tools/issues/13).
- **Report an accessibility barrier.** Use the [accessibility form](https://github.com/maling-it/tools/issues/new?template=accessibility.yml). See the [accessibility statement](.github/ACCESSIBILITY.md).
- **Report a security problem.** Please do not open a public issue. Follow the [security policy](.github/SECURITY.md).
- **Pick something from the roadmap.** The [project board](https://github.com/orgs/maling-it/projects/3) and the [Roadmap wiki page](https://github.com/maling-it/tools/wiki/Roadmap) list what is planned. Issues labelled `good first issue` or `help wanted` are good places to start. Comment on an issue before you begin so work is not duplicated.
- **Improve the docs.** The README lives in the repository, and the [wiki](https://github.com/maling-it/tools/wiki) can be edited by opening an issue or a pull request that describes the change.

## Set up your machine

You need [Bun](https://bun.sh) and Node.js 22.17 or newer.

```bash
git clone https://github.com/maling-it/tools.git
cd tools
bun install
bun run dev        # http://localhost:6969/tools/
```

| Command | What it does |
| --- | --- |
| `bun run test` | Unit tests (Vitest) |
| `bun run build` | Builds the static site into `build/` |
| `bun run test:e2e` | Browser tests (Playwright); run `bun run build` first. They use the Google Chrome installed on your machine, or the browser in `CHROME_PATH` |
| `bun run mcp` | Starts the MCP server |

## Adding a tool

1. Add an entry to `src/lib/tools.js`. The sidebar, search, home page, `llms.txt`, `tools.json` and the sitemap pick it up automatically.
2. Put the logic in `src/lib` as a pure function that throws a friendly `Error` for bad input.
3. Create `src/routes/<category>/<slug>/+page.svelte`. Most tools use `ToolPage` (text in, text out) or `ConvertPage` (live output).
4. Add a Vitest test next to the logic.
5. Optional: expose the tool to AI agents in `src/lib/agentTools.js`.

The wiki page [Adding a Tool](https://github.com/maling-it/tools/wiki/Adding-a-Tool) walks through an example.

## Principles for changes

- **Nothing leaves the browser.** Tools must not upload what people type.
- **Keep secrets out.** Do not put real tokens, passwords or personal data in examples, tests or screenshots.
- **Work everywhere.** Check light and dark mode, a phone-sized screen and the keyboard.
- **Keep it small.** Prefer focused changes over large rewrites. Logic belongs in `src/lib` and needs a test.

## Commits and pull requests

1. Fork the repository and create a branch from `master`.
2. Run `bun run test` and `bun run build` (and `bun run test:e2e` for anything that changes the UI).
3. Write the commit subject in the imperative mood, for example `Add CSS minifier tool`, and **sign off** your commits with `git commit -s`. The sign-off says you wrote the change or have the right to submit it under the project's license.
4. Open a pull request and fill in the template. Describe what changed and why, and link the issue it closes (`Closes #12`).
5. The CI workflow runs the unit tests, the build and the browser tests on every pull request. A maintainer reviews it once they pass.

Releases are made by the maintainers; see the wiki page [Releasing](https://github.com/maling-it/tools/wiki/Releasing).

## License

Mools is released under the [MIT License](LICENSE). By contributing you agree that your work is released under it.
