# Changelog

All notable changes to Mools are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **PDF Merge, PDF Split and a Favicon Generator.** PDF Merge joins files in the order you choose. PDF Split keeps chosen pages (`1-3, 5, 8-`, in the order written), splits into groups (`1-3; 4-6`) or into one file per page, as a ZIP. The Favicon Generator turns one image into `favicon.ico`, PNG icons from 16 to 512 pixels, an Apple touch icon, a web manifest and the `<head>` HTML. All three work in the browser, and files never leave it. That makes 126 tools. ([#13](https://github.com/maling-it/tools/issues/13))
- **Old Indonesian Spelling Converter, rebuilt.** It now converts both ways (modern to old and old to modern) and supports two old spellings: Van Ophuijsen (1901 to 1947) and the Republican spelling (1947 to 1972, before the EYD). You can list words that stay as they are, web and email addresses are never changed, and a table shows which letters change. The `van_ophuijsen_spelling` agent tool takes `system`, `direction` and `keep` as well.
- **Four more tools from the backlog**, also available to agents (`normalize_emails`, `minify_css`, `generate_mac_addresses`, `format_mac_address`, `generate_rsa_key_pair`): an Email Normalizer (lowercase, +tags, Gmail dots, duplicates), a CSS Minifier (keeps strings, `url()`, `/*! */` comments, percentages and `calc()` intact), a MAC Address Generator (four notations, unicast or multicast, locally administered or not, plus a converter that tells what an address is) and an RSA Key Pair Generator (2048 to 4096 bits, PEM, created with Web Crypto in your browser). That makes 123 tools and 88 agent tools. ([#13](https://github.com/maling-it/tools/issues/13))
- **Four tools from the backlog**, each also available to agents (`validate_iban`, `json_to_schema`, `docker_run_to_compose`, `build_gitignore`): an IBAN Validator (country, length and mod-97 check digits, one IBAN per line), a JSON Schema Generator (draft 2020-12, formats, required keys), Docker Run to Compose (ports, volumes, environment, networks and notes for options Compose cannot express) and a .gitignore Generator (19 templates). That makes 119 tools and 83 agent tools. ([#13](https://github.com/maling-it/tools/issues/13))
- **Lighthouse in CI.** The home page and two tool pages are measured on every pull request, with budgets for performance, accessibility, largest contentful paint, layout shift and blocking time (`lighthouserc.json`). ([#8](https://github.com/maling-it/tools/issues/8))
- The release workflow regenerates the wiki's Tool Catalog and the counts on its Home page from `src/lib/tools.js` (`scripts/wiki-catalog.mjs`). ([#10](https://github.com/maling-it/tools/issues/10))

### Fixed
- The spelling converter turned ALL CAPS words into mixed case (`JAKARTA` became `DjAKARTA`, `UNDANG` became `OeNDANG`). It now works word by word, so capitals stay capitals.
- The sidebar no longer jumps when a tool page loads: the group of the current page is open in the prerendered HTML, which lowers layout shift on tool pages from 0.072 to 0.003.

## [1.3.0] - 2026-11-15

Mools is now accessible (WCAG 2.1 AA), friendlier to agents, safer with regular expressions and watches its own size.

### Added
- **Accessibility pass (WCAG 2.1 AA).** A "Skip to main content" link and a `main` region, labelled navigation landmarks, a clear 3 pixel focus outline in every theme and style, and support for reduced motion. The command palette now follows the combobox pattern (`aria-activedescendant`, Home and End, focus kept inside, focus restored on close). Copying, favorites, palette results and live converter output are announced to screen readers. Wordle no longer relies on color alone. The accessibility statement describes what is covered and what is not.
- **Performance budget.** `bun run budget` measures the JavaScript and CSS each of the 128 pages loads eagerly and fails when a page goes over its budget. It runs on every pull request. ([#8](https://github.com/maling-it/tools/issues/8))
- Automated accessibility tests (axe-core) in the browser tests: all 128 pages in the light default style, a set of 12 pages in every other theme and style, and the open command palette. They run on every pull request.

### Changed
- **Smaller pages.** Only the Bootstrap Icons the site uses are shipped, so the global CSS drops from 62 KB to 50 KB gzipped. After adding an icon, run `node scripts/build-icons-css.mjs`.
- Better contrast: secondary text and inline code in dark mode, the count badges on the home page, the technology badges and statistics on the About page. The About statistics now show the real number of tools and categories.
- The sidebar markup is valid (dividers no longer sit directly inside the list), decorative logos have empty alt text, and the desktop Search button has an accessible name that matches its label.

### Fixed
- **Friendlier agent tools.** Errors say what to fix instead of showing a bare parser message: invalid JSON, YAML or TOML names the format, Base64 and percent-encoding problems are explained, unit conversions list the valid units, and invalid Roman numerals, dates, cron expressions, times, SQL and bcrypt hashes are described. `cron_explain` (and the Crontab Generator page) showed no message at all, because the cron library throws plain strings; they are now proper errors.
- Tools no longer answer with an empty response. `extract_data` says `No email addresses found.`, other tools explain an empty result, and anything else answers `(The result is empty.)`.
- MCP prompts mark placeholders that are still open and tell the model to take them from the conversation or ask, because Claude Code passes one word per argument. The README explains how to use the prompts as slash commands.
- A regular expression with catastrophic backtracking, for example `(a+)+$`, no longer freezes the browser tab. Regex Tester, Replace Text, Bulk File Find & Replace, the "Find and replace" operation of the Bulk Text Transformer and the rename rules of the Bulk File Renamer now run patterns in a Web Worker with a time limit of a few seconds. A pattern that takes too long is stopped with a clear message, and the tool keeps working. Plain (non-regex) searches run as before. ([#20](https://github.com/maling-it/tools/issues/20))

## [1.2.0] - 2026-11-15

Mools now works offline, remembers your favorite tools and has a hardened MCP server. The project also has browser tests, a public roadmap and a complete set of community files.

### Added
- **Offline support.** Mools can be installed as an app and every page works without a connection after the first visit (a web app manifest, icons and a service worker, about 8 MB). A banner explains when you are offline, and another offers a reload when a new version is ready. The Telegram tester says clearly that it needs the internet.
- **Favorites.** A star button on every tool page. Favorites appear at the top of the sidebar, on the home page and first in the command palette, and are kept in the browser.
- **Browser tests** (Playwright) that open every page and exercise the main tools, run by a new `CI` workflow on every pull request. The deploy workflow runs them too, so a broken page blocks it.
- **Community files**: `CONTRIBUTING.md`, a code of conduct (Contributor Covenant 2.1), a security policy, an accessibility statement and a support guide, plus an accessibility issue form. The repository's community standards checklist is complete.
- **A public roadmap**: a project board, version milestones and tracked issues. New issues from the issue forms are added to the board automatically.
- **MIT license** and repository metadata (description, homepage, bugs and license) in `package.json`.
- A `Release` workflow that publishes a GitHub release when a version tag is pushed. Release tags are signed.

### Changed
- **MCP server:** tool calls run in a worker thread with a 15 second limit, and arguments are checked against each tool's schema, with readable messages for wrong types, bad values and out-of-range numbers. Unknown arguments are now rejected, because the schemas already said they were not allowed.
- **MCP clients, note:** `cron_explain` now reports the `timeZone` and returns every run as an object with `utc` and `local` times; `nextRuns` used to be a list of UTC strings.
- The logo and screenshots are about 21% smaller; every pixel is unchanged.

### Fixed
- A regular expression with catastrophic backtracking, for example `(a+)+$`, froze the MCP server for good. Such calls are now stopped after 15 seconds and the server keeps answering. (The web tools that take a pattern can still freeze the tab; this is tracked in [#20](https://github.com/maling-it/tools/issues/20).)
- Passing the wrong type to an MCP tool gave a raw JavaScript error such as `text.normalize is not a function`.

## [1.1.0] - 2026-11-15

### Added
- **Bulk Tools** category with 9 tools: Bulk Text Transformer, Bulk File Hasher, Bulk Image Converter, Bulk QR Code Generator, Bulk File Renamer, Bulk File Find & Replace, Data Extractor, CSV Splitter and Text Chunker. ZIP downloads use `fflate`.
- Five bulk tools for agents (`bulk_transform`, `extract_data`, `chunk_text`, `plan_file_renames`, `split_csv`), bringing the total to 79 agent tools and 115 pages.

## [1.0.0] - 2026-11-15

First stable release: 106 tools, agent support and a documented project.

### Added
- **Agent support**: `llms.txt`, `tools.json`, a sitemap, `SoftwareApplication` JSON-LD, WebMCP registration and a stdio MCP server with tools, prompts, resources and tool annotations.
- **AI & Vibe Coding** category: AGENTS.md and rules generator, Prompt Builder, Prompt Library (24 prompts), LLM Token Counter, Repo Packer, DESIGN.md Generator, Commit Message Builder, llms.txt Generator and MCP Config Generator.
- About 40 developer tools: Regex Tester, Text Diff, JSON Diff, YAML, TOML and XML conversion, Markdown to HTML, SQL Formatter, color, unit and base converters, JWT Decoder, HMAC, TOTP, bcrypt, password strength, cron, subnet and chmod calculators, UUID and ULID, HTTP status and MIME lookups, URL Parser and more.
- Command palette (Ctrl+K), breadcrumbs, collapsible sidebar groups, related tools, a footer, home page search and a recently used list.
- Light, dark and automatic themes.
- Contact page with a pre-filled GitHub issue form, GitHub issue templates and a pull request template.
- README with logo and screenshots.

### Changed
- The deploy workflow uses Node 24 and bun, and runs the tests before building.
- The About page shows the current stack and tool counts.

### Fixed
- The sidebar overlapped the page between 768 and 991 px, and stayed open after navigating on small screens.
- The style picker rendered duplicate element IDs, so its labels toggled the wrong option.

## [0.5.0] - 2026-11-15

### Added
- Converters: JSON to CSV, CSV to HTML table, HTML table to JSON, HTML to text, link extractor, XML to JSON, properties, binary, image to Base64, HEIC conversion and image to PDF.
- Security and SEO: password and memorable password generators, MD5 and SHA hashes, title maker and meta tags.
- Generators: CSS button, QR code, barcode, jQuery snippets, Amazon and Audible link makers, feedback and name generators.
- Calculators and counters: crypto average, work hours, concrete, dirt, cap rate, easy counter and click counter.
- Games: Wordle, Tic Tac Toe and Memory Match.

## [0.4.0] - 2026-11-15

### Changed
- Upgraded to Svelte 5, SvelteKit 3 and Vite 8, and switched the package manager to bun. The SvelteKit config now lives in `vite.config.js`.
- Rebuilt `ToolPage` with Svelte 5 and moved every tool onto it, with copy and clear buttons and inline errors.
- The sidebar, home page and category pages are built from a single tool registry (`src/lib/tools.js`). The sidebar search works.
- Rewrote the README.

### Added
- Base64 and JSON Formatter tools.
- Vitest unit tests for the tool logic.

### Fixed
- Replace Text did not work.
- Unescaping decoded entities twice, for example `&amp;lt;` became `<`.
- URL Decode threw on malformed input.
- The CSV parser broke on quoted fields and short rows, and the Van Ophuijsen converter now converts in a single pass.
- The active sidebar link was never highlighted.

## [0.3.0] - 2025-06-01

### Added
- Shared `ToolPage` component and text utility functions.
- New tools and categories for strings, converters and testing.
- About and Contact pages.

### Changed
- Simplified the style (core) switcher.

## [0.2.0] - 2024-02-04

### Added
- Sidebar with search and a navbar.
- Style (core) and theme switchers.
- Telegram Bot Testing page.
- The Mools favicon.

## [0.1.0] - 2024-01-31

### Added
- First public version: a SvelteKit site with the Halfmoon theme, deployed to GitHub Pages.
- String tools: HTML, JavaScript, XML and URL escaping, case converter, replace text and word counter.
- CSV to JSON and Van Ophuijsen spelling converters.
- Error page and SEO metadata.

[1.2.0]: https://github.com/maling-it/tools/releases/tag/v1.2.0
[1.1.0]: https://github.com/maling-it/tools/releases/tag/v1.1.0
[1.0.0]: https://github.com/maling-it/tools/releases/tag/v1.0.0
[0.5.0]: https://github.com/maling-it/tools/releases/tag/v0.5.0
[0.4.0]: https://github.com/maling-it/tools/releases/tag/v0.4.0
[0.3.0]: https://github.com/maling-it/tools/releases/tag/v0.3.0
[0.2.0]: https://github.com/maling-it/tools/releases/tag/v0.2.0
[0.1.0]: https://github.com/maling-it/tools/releases/tag/v0.1.0
