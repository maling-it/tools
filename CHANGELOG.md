# Changelog

All notable changes to Mools are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- MIT license, plus repository metadata (description, homepage, bugs and license) in `package.json`.
- Favorites: a star button on every tool page. Favorites appear at the top of the sidebar, on the home page and first in the command palette, and are kept in the browser.
- Browser tests (Playwright) that open every page and exercise the main tools. They run in a new `CI` workflow on pull requests and block the deploy when a page breaks.
- A public roadmap: a project board, version milestones (1.2.0, 1.3.0, 2.0.0) and ten tracked issues. New issues from the issue forms are added to the board automatically.
- A `Release` workflow that publishes a GitHub release when a version tag is pushed, and signed release tags.

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

[1.1.0]: https://github.com/maling-it/tools/releases/tag/v1.1.0
[1.0.0]: https://github.com/maling-it/tools/releases/tag/v1.0.0
[0.5.0]: https://github.com/maling-it/tools/releases/tag/v0.5.0
[0.4.0]: https://github.com/maling-it/tools/releases/tag/v0.4.0
[0.3.0]: https://github.com/maling-it/tools/releases/tag/v0.3.0
[0.2.0]: https://github.com/maling-it/tools/releases/tag/v0.2.0
[0.1.0]: https://github.com/maling-it/tools/releases/tag/v0.1.0
