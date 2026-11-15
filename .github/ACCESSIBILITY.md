# Accessibility statement

Mools should be usable by everyone, including people who rely on a keyboard, a screen reader, zoom or high contrast. Our goal is to meet the [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/) at level AA.

**Status:** much improved, and honest about what is left. Mools has had an automated and keyboard-based review but not yet a manual audit with real screen readers. This page says what is in place, what is known to fall short and how to tell us about a barrier. It was last reviewed on 15 November 2026 and is reviewed again with every release.

## What is in place

- **Structure.** Every page has one `main` region, labelled navigation landmarks (site, tools, breadcrumb) and a "Skip to main content" link as the first stop for keyboard users. Every tool is a normal page with labelled form fields, buttons and headings.
- **Keyboard.** The sidebar, its collapsible groups, the theme and style menus, the favorites button and the tool pages work with the keyboard. The command palette (Ctrl+K) follows the combobox pattern: arrow keys, Home and End move through the results, Enter opens one, Tab stays inside, and Escape closes it and returns focus to where you were. The mobile sidebar traps focus and closes with Escape.
- **Focus.** Every focused control has a 3 pixel outline in the accent color, in all themes and styles.
- **Contrast.** Text and controls meet 4.5:1 (3:1 for large text and interface parts) in light and dark mode and in all three styles on a representative set of pages. Automated tests check this on every pull request.
- **Not by color alone.** Wordle writes the state of each letter out for screen readers and adds a symbol (✓, ~, ✕) to each tile.
- **Announcements.** Copying, adding a favorite, search results in the command palette and updated results in the live converters are announced through a polite live region. Errors use `role="alert"`.
- **Motion.** Animations, transitions and smooth scrolling are switched off when your system asks for reduced motion.
- **Themes.** Light, dark and automatic themes, and three Halfmoon styles. The interface follows the size of the window and works on phones.

## Known limitations

- **No manual audit yet.** The checks so far are automated ([axe-core](https://github.com/dequelabs/axe-core) on all 128 pages in the light default style, and on 12 representative pages and the command palette in every other combination of theme and style) plus keyboard tests. Automated tools find only part of the problems, so real screen reader and magnifier testing is still needed.
- **Zoom and text spacing.** Layouts have not been checked systematically at 400% zoom or with increased text spacing.
- **Games.** Wordle, Memory Match and Tic Tac Toe expose labels and states, but have not been tried with screen readers.
- **Generated images.** QR codes, barcodes and placeholder images have short descriptions, not the full encoded content.
- **Third-party parts.** The Halfmoon and Bootstrap components Mools builds on have their own accessibility characteristics.

Remaining work is tracked in [issue #7](https://github.com/maling-it/tools/issues/7) and on the [roadmap](https://github.com/orgs/maling-it/projects/3).

## Supported environments

Mools is built for the current versions of Google Chrome, Microsoft Edge, Mozilla Firefox and Safari on desktop and mobile; the automated tests run in Chrome. Screen reader support has not been tested systematically yet, so reports from people who use NVDA, JAWS, VoiceOver or TalkBack are especially valuable.

## Tell us about a barrier

If something is hard or impossible to use:

1. Open an [accessibility report](https://github.com/maling-it/tools/issues/new?template=accessibility.yml). Say which page or tool, what you were trying to do, and which browser and assistive technology you use.
2. If you cannot use GitHub, you can describe the problem in a private [security advisory](https://github.com/maling-it/tools/security/advisories/new) titled "Accessibility report", and the maintainers will read it.

We aim to reply within about a week. Barriers that stop someone from using a tool at all are fixed first.
