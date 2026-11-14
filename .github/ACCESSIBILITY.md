# Accessibility statement

Mools should be usable by everyone, including people who rely on a keyboard, a screen reader, zoom or high contrast. Our goal is to meet the [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/) at level AA.

**Status:** partly there, and honest about it. Mools has not had a full accessibility audit yet. This page says what is in place, what is known to fall short and how to tell us about a barrier. It was last reviewed on 15 November 2026 and is reviewed again with every release.

## What is in place

- Every tool is a normal web page with labelled form fields, buttons and headings.
- Icon-only buttons have text labels for assistive technology, and toggles (for example "Add to favorites") report their state.
- The sidebar, command palette (Ctrl+K), theme menu and tool pages can be used with a keyboard.
- The command palette is announced as a dialog with a list of options.
- Light, dark and automatic themes, and three Halfmoon styles, are available. The interface follows the size of the window and works on phones.
- Results that change as you type, such as errors and counters, are shown as text next to the input.

## Known limitations

- **No full audit yet.** Contrast, focus visibility and screen reader behavior have not been checked systematically in all three styles and both themes.
- **No "skip to content" link** on pages with the long sidebar.
- **Games.** Wordle shows the state of a letter mostly with color. Memory Match and Tic Tac Toe are better but untested with screen readers.
- **Animations.** The interface does not yet honor the "reduce motion" setting everywhere.
- **Generated images.** QR codes, barcodes and placeholder images have short descriptions, not the full encoded content.
- **Third-party parts.** The Halfmoon and Bootstrap components Mools builds on have their own accessibility characteristics.

These are tracked in [issue #7, Accessibility pass (WCAG 2.1 AA)](https://github.com/maling-it/tools/issues/7), which is part of the [roadmap](https://github.com/orgs/maling-it/projects/3).

## Supported environments

Mools is tested with the current versions of Google Chrome, Microsoft Edge, Mozilla Firefox and Safari on desktop and mobile. Screen reader support has not been tested systematically yet, so reports from people who use NVDA, JAWS, VoiceOver or TalkBack are especially valuable.

## Tell us about a barrier

If something is hard or impossible to use:

1. Open an [accessibility report](https://github.com/maling-it/tools/issues/new?template=accessibility.yml). Say which page or tool, what you were trying to do, and which browser and assistive technology you use.
2. If you cannot use GitHub, you can describe the problem in a private [security advisory](https://github.com/maling-it/tools/security/advisories/new) titled "Accessibility report", and the maintainers will read it.

We aim to reply within about a week. Barriers that stop someone from using a tool at all are fixed first.
