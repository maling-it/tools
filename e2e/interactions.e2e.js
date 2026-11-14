import fs from 'node:fs';
import { unzipSync } from 'fflate';
import { test, expect } from './fixtures.js';

test('Replace Text replaces all matches', async ({ page }) => {
	await page.goto('/tools/string/replace-text/');
	await page.fill('#find-input', 'cat');
	await page.fill('#replace-input', 'dog');
	await page.fill('#main-textarea', 'cat cat bird');
	await page.getByRole('button', { name: 'Replace All' }).click();
	await expect(page.locator('#main-textarea')).toHaveValue('dog dog bird');
});

test('CSV to JSON converts quoted fields live', async ({ page }) => {
	await page.goto('/tools/converter/csv-to-json/');
	await page.fill('#main-textarea', 'name,note\n"Doe, Jane","said ""hi"""');
	const output = page.locator('.card pre').first();
	await expect(output).toContainText('"name": "Doe, Jane"');
	await expect(output).toContainText('said \\"hi\\"');
});

test('JSON Formatter prettifies and reports errors', async ({ page }) => {
	await page.goto('/tools/converter/json-formatter/');
	await page.fill('#main-textarea', '{"a":[1,2]}');
	await page.getByRole('button', { name: 'Prettify' }).click();
	await expect(page.locator('#main-textarea')).toHaveValue('{\n  "a": [\n    1,\n    2\n  ]\n}');
	await page.fill('#main-textarea', '{oops');
	await page.getByRole('button', { name: 'Prettify' }).click();
	await expect(page.getByRole('alert')).toBeVisible();
});

test('command palette finds a tool and opens it', async ({ page }) => {
	await page.goto('/tools/');
	await page.keyboard.press('Control+k');
	await expect(page.getByRole('dialog', { name: 'Search tools' })).toBeVisible();
	await page.keyboard.type('jwt');
	await expect(page.getByRole('option').first()).toContainText('JWT Decoder');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/security\/jwt-decoder\/$/);
	await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('JWT Decoder');
});

test('theme menu switches and remembers the theme', async ({ page }) => {
	await page.goto('/tools/');
	await page.locator('button[aria-label^="Choose theme"]:visible').first().click();
	await page.locator('.dropdown-menu.show').getByRole('button', { name: 'Dark' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark');
});

test('sidebar groups collapse and the home search filters tools', async ({ page }) => {
	await page.goto('/tools/security/jwt-decoder/');
	const group = page.locator('button.sidebar-group', { hasText: 'Security & Privacy' });
	await expect(group).toHaveAttribute('aria-expanded', 'true');
	await group.click();
	await expect(group).toHaveAttribute('aria-expanded', 'false');
	await page.goto('/tools/');
	await page.fill('#home-search', 'password');
	await expect(page.getByText(/tools? found/)).toBeVisible();
});

test('Bulk File Renamer downloads a renamed ZIP', async ({ page }) => {
	await page.goto('/tools/bulk/bulk-file-renamer/');
	await page.setInputFiles('#files', [
		{ name: 'My Pic 1.JPG', mimeType: 'image/jpeg', buffer: Buffer.from('1') },
		{ name: 'My Pic 2.JPG', mimeType: 'image/jpeg', buffer: Buffer.from('2') }
	]);
	await page.fill('#prefix', 'trip-');
	await page.selectOption('#case-mode', 'kebab');
	await page.selectOption('#extension', 'lower');
	const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'ZIP' }).click()]);
	const files = unzipSync(new Uint8Array(fs.readFileSync(await download.path())));
	expect(Object.keys(files).sort()).toEqual(['trip-my-pic-1.jpg', 'trip-my-pic-2.jpg']);
});

test('Contact form opens a pre-filled GitHub issue form', async ({ page, context }) => {
	// GitHub itself is not needed; answer the popup locally and inspect the address it was sent to.
	await context.route('https://github.com/**', (route) => route.fulfill({ body: 'stub', contentType: 'text/plain' }));
	await page.goto('/tools/contact/');
	await page.selectOption('#tool', 'JSON Formatter');
	await page.fill('#title', 'Crashes on empty input');
	await page.fill('#message', 'Click Prettify with nothing typed.');
	const [popup] = await Promise.all([context.waitForEvent('page'), page.getByRole('button', { name: 'Open on GitHub' }).click()]);
	await popup.waitForLoadState();
	const url = new URL(popup.url());
	expect(url.pathname).toBe('/maling-it/tools/issues/new');
	expect(url.searchParams.get('template')).toBe('bug_report.yml');
	expect(url.searchParams.get('title')).toBe('Bug: Crashes on empty input');
	expect(url.searchParams.get('tool')).toBe('JSON Formatter');
	await popup.close();
});
