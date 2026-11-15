import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures.js';

// Automated WCAG 2.0/2.1 A and AA checks (axe-core) plus keyboard and screen reader behaviour.
// Automated checks cannot find everything; see .github/ACCESSIBILITY.md for what still needs a manual review.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const catalog = JSON.parse(fs.readFileSync(new URL('../build/tools.json', import.meta.url), 'utf8'));
const allPages = ['/tools/', '/tools/about/', '/tools/contact/', ...catalog.categories.map((c) => `/tools/${c.id}/`), ...catalog.pages.map((p) => `/tools/${p.category}/${p.slug}/`)];

// One page of every kind of layout, for the other themes and styles.
const samplePages = [
	'/tools/',
	'/tools/about/',
	'/tools/contact/',
	'/tools/string/',
	'/tools/string/change-case/',
	'/tools/string/regex-tester/',
	'/tools/converter/csv-to-json/',
	'/tools/security/password-generator/',
	'/tools/games/wordle/',
	'/tools/bulk/bulk-file-renamer/',
	'/tools/ai/prompt-library/',
	'/tools/calculator/work-hour-calculator/'
];

const violationsOf = async (page) => {
	const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
	return violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.slice(0, 3).map((n) => `${n.target.join(' ')}  ${(n.any[0]?.data?.contrastRatio ?? '')}`).join('\n    ')}`);
};

const setLook = (page, theme, core) =>
	page.addInitScript(([t, c]) => {
		try {
			localStorage.setItem('theme', t);
			localStorage.setItem('core', c);
		} catch {
			// Storage can be blocked; the default look is then tested.
		}
	}, [theme, core]);

test.describe('axe: no WCAG A or AA violations on any page (light, default style)', () => {
	for (const url of allPages) {
		test(url, async ({ page }) => {
			await setLook(page, 'light', 'default');
			await page.goto(url);
			expect(await violationsOf(page)).toEqual([]);
		});
	}
});

test.describe('axe: other themes and styles', () => {
	const looks = [['dark', 'default'], ['light', 'modern'], ['dark', 'modern'], ['light', 'elegant'], ['dark', 'elegant']];
	for (const [theme, core] of looks) {
		for (const url of samplePages) {
			test(`${theme} ${core} ${url}`, async ({ page }) => {
				await setLook(page, theme, core);
				await page.goto(url);
				expect(await violationsOf(page)).toEqual([]);
			});
		}
	}
});

test.describe('axe: interactive states', () => {
	for (const [theme, core] of [['light', 'default'], ['dark', 'modern']]) {
		test(`command palette open (${theme} ${core})`, async ({ page }) => {
			await setLook(page, theme, core);
			await page.goto('/tools/');
			await page.keyboard.press('Control+k');
			await page.keyboard.type('json');
			await expect(page.getByRole('option').first()).toBeVisible();
			expect(await violationsOf(page)).toEqual([]);
		});

		test(`Wordle after a guess (${theme} ${core})`, async ({ page }) => {
			await setLook(page, theme, core);
			await page.goto('/tools/games/wordle/');
			await page.keyboard.type('crane');
			await page.keyboard.press('Enter');
			await expect(page.getByRole('gridcell').first()).toHaveAttribute('aria-label', /,/);
			expect(await violationsOf(page)).toEqual([]);
		});
	}

	test('a tool with a result and an error', async ({ page }) => {
		await page.goto('/tools/converter/json-formatter/');
		await page.fill('#main-textarea', '{oops');
		await page.getByRole('button', { name: 'Prettify' }).click();
		await expect(page.getByRole('alert')).toBeVisible();
		expect(await violationsOf(page)).toEqual([]);
	});
});

test.describe('keyboard', () => {
	test('"Skip to main content" is the first stop and moves focus to the main region', async ({ page }) => {
		await page.goto('/tools/string/change-case/');
		await page.keyboard.press('Tab');
		const skip = page.getByRole('link', { name: 'Skip to main content' });
		await expect(skip).toBeFocused();
		await expect(skip).toBeVisible();
		await page.keyboard.press('Enter');
		await expect(page.locator('main#main')).toBeFocused();
		await expect(page.locator('main h1')).toBeVisible();
	});

	test('every page has one main region and labelled navigation landmarks', async ({ page }) => {
		await page.goto('/tools/string/change-case/');
		await expect(page.getByRole('main')).toHaveCount(1);
		const navs = await page.getByRole('navigation').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('aria-label')));
		expect(navs.every(Boolean), `unlabelled navigation landmarks: ${JSON.stringify(navs)}`).toBe(true);
		expect(new Set(navs).size).toBe(navs.length);
	});

	test('focused controls have a visible indicator', async ({ page }) => {
		await page.goto('/tools/string/change-case/');
		for (const target of [page.locator('#sidebar .nav-link').first(), page.getByRole('button', { name: 'Uppercase' }), page.locator('#main-textarea')]) {
			await target.focus();
			await page.keyboard.press('Shift+Tab');
			await page.keyboard.press('Tab');
			const style = await target.evaluate((el) => {
				const s = getComputedStyle(el);
				return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
			});
			expect(style.style).not.toBe('none');
			expect(style.width).toBeGreaterThanOrEqual(2);
		}
	});

	test('the command palette follows the combobox pattern', async ({ page }) => {
		await page.goto('/tools/');
		const opener = page.locator('button[aria-keyshortcuts="Control+K"]');
		await opener.focus();
		await page.keyboard.press('Enter');

		const input = page.getByRole('combobox', { name: 'Search tools' });
		await expect(input).toBeFocused();
		await expect(input).toHaveAttribute('aria-expanded', 'true');
		const listbox = await input.getAttribute('aria-controls');
		await expect(page.locator(`#${listbox}`)).toHaveAttribute('role', 'listbox');

		await page.keyboard.type('base64');
		await expect(page.getByRole('option').first()).toBeVisible();
		const first = await input.getAttribute('aria-activedescendant');
		expect(first).toBeTruthy();
		await expect(page.locator(`#${first}`)).toHaveAttribute('aria-selected', 'true');

		await page.keyboard.press('ArrowDown');
		const second = await input.getAttribute('aria-activedescendant');
		expect(second).not.toBe(first);
		await expect(page.locator(`#${second}`)).toHaveAttribute('aria-selected', 'true');
		await expect(page.locator(`#${first}`)).toHaveAttribute('aria-selected', 'false');

		// Focus stays in the dialog, and Escape closes it and gives focus back.
		await page.keyboard.press('Tab');
		await expect(input).toBeFocused();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog', { name: 'Search tools' })).toHaveCount(0);
		await expect(opener).toBeFocused();
	});

	test('the sidebar group buttons are real buttons with a state', async ({ page }) => {
		await page.goto('/tools/');
		const group = page.locator('button.sidebar-group').first();
		await group.focus();
		const before = await group.getAttribute('aria-expanded');
		await page.keyboard.press('Enter');
		expect(await group.getAttribute('aria-expanded')).not.toBe(before);
	});
});

test.describe('keyboard: menus and the mobile sidebar', () => {
	test('the theme menu works with the keyboard', async ({ page }) => {
		await page.goto('/tools/');
		const toggle = page.locator('button[aria-label^="Choose theme"]:visible').first();
		await toggle.focus();
		await page.keyboard.press('Enter');
		await expect(page.locator('.dropdown-menu.show').first()).toBeVisible();
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');
		await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark');
		await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'dark');
	});

	test('the mobile sidebar opens, holds focus and closes with Escape', async ({ page }) => {
		await page.setViewportSize({ width: 400, height: 800 });
		await page.goto('/tools/');
		const toggle = page.getByRole('button', { name: 'Toggle sidebar' });
		await toggle.focus();
		await page.keyboard.press('Enter');
		const sidebar = page.locator('#sidebar');
		await expect(sidebar).toHaveClass(/show/);
		await expect(sidebar).toHaveAttribute('aria-modal', 'true');
		// Focus moved into the open sidebar.
		await expect(page.locator('#sidebar :focus, #sidebar:focus')).toHaveCount(1);
		await page.keyboard.press('Escape');
		await expect(sidebar).not.toHaveClass(/show/);
		await expect(toggle).toBeFocused();
	});
});

test.describe('screen readers and motion', () => {
	test('actions are announced through a live region', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
		await page.goto('/tools/string/change-case/');
		const status = page.locator('[role="status"].visually-hidden');
		await page.getByRole('button', { name: 'Add to favorites' }).click();
		await expect(status).toContainText('added to favorites');
		await page.fill('#main-textarea', 'hello');
		await page.getByRole('button', { name: 'Copy' }).click();
		await expect(status).toContainText('Copied to clipboard');
	});

	test('live converters report that the output changed', async ({ page }) => {
		await page.goto('/tools/converter/base64/');
		await page.fill('#main-textarea', 'hello');
		await page.getByRole('button', { name: 'Encode' }).click();
		await page.goto('/tools/bulk/data-extractor/');
		await page.fill('#main-textarea', 'write to a@b.com');
		await expect(page.locator('[role="status"].visually-hidden')).toContainText('Result updated', { timeout: 4000 });
	});

	test('Wordle does not rely on color alone', async ({ page }) => {
		await page.goto('/tools/games/wordle/');
		await page.keyboard.type('crane');
		await page.keyboard.press('Enter');
		const labels = await page.getByRole('gridcell').evaluateAll((cells) => cells.slice(0, 5).map((c) => c.getAttribute('aria-label')));
		expect(labels).toHaveLength(5);
		for (const label of labels) expect(label).toMatch(/^[A-Z], (correct position|in the word, wrong position|not in the word)$/);
		const symbol = await page.getByRole('gridcell').first().evaluate((el) => getComputedStyle(el, '::after').content);
		expect(['"✓"', '"~"', '"✕"']).toContain(symbol);
	});

	test('animations and transitions are switched off when the visitor asks for reduced motion', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/tools/');
		const duration = await page.locator('a[href$="/string/"] .card, .tool-card').first().evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
		expect(duration).toBeLessThan(0.001);
	});
});
