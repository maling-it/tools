import { test, expect } from './fixtures.js';

test('the web app manifest and its icons are valid', async ({ request }) => {
	const response = await request.get('/tools/manifest.webmanifest');
	expect(response.ok()).toBe(true);
	const manifest = await response.json();
	expect(manifest).toMatchObject({ short_name: 'Mools', display: 'standalone', scope: './', start_url: './' });
	const sizes = manifest.icons.map((icon) => icon.sizes);
	expect(sizes).toContain('192x192');
	expect(sizes).toContain('512x512');
	expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
	for (const icon of manifest.icons) {
		const file = await request.get(`/tools/${icon.src}`);
		expect(file.ok(), icon.src).toBe(true);
		expect(file.headers()['content-type']).toContain('image/png');
	}
});

test('the page links the manifest', async ({ page }) => {
	await page.goto('/tools/');
	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest\.webmanifest$/);
	await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
});

test('every page and tool works offline after one visit', async ({ page, context }) => {
	await page.goto('/tools/');

	// The service worker takes control and caches the whole site in the background.
	await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 20_000 }).toBe(true);
	await expect
		.poll(
			() =>
				page.evaluate(async () => {
					const key = (await caches.keys()).find((name) => name.startsWith('mools-'));
					return key ? (await (await caches.open(key)).keys()).length : 0;
				}),
			{ timeout: 40_000 }
		)
		.toBeGreaterThan(300);

	await context.setOffline(true);
	await expect(page.locator('.status-stack').getByText('You are offline')).toBeVisible();

	// A page that was never opened before, reached with a full page load.
	await page.goto('/tools/security/jwt-decoder/');
	await expect(page.getByRole('heading', { name: 'JWT Decoder', level: 1 })).toBeVisible();

	// A tool does real work offline.
	await page.goto('/tools/string/replace-text/');
	await page.fill('#find-input', 'a');
	await page.fill('#replace-input', 'b');
	await page.fill('#main-textarea', 'banana');
	await page.getByRole('button', { name: 'Replace All' }).click();
	await expect(page.locator('#main-textarea')).toHaveValue('bbnbnb');

	// Client side navigation and the machine readable files also work.
	await page.locator('#sidebar').getByRole('link', { name: 'Word Count' }).click();
	await expect(page).toHaveURL(/\/string\/word-counter\/$/);
	const llms = await page.evaluate(() => fetch('/tools/llms.txt').then((r) => r.text()));
	expect(llms).toContain('# Mools');

	// The one tool that needs the internet explains why it cannot run.
	await page.goto('/tools/testing/telegram/');
	await page.fill('#bot-token', '123:abc');
	await page.fill('#chat-id', '1');
	await page.fill('#text', 'hello');
	await page.getByRole('button', { name: 'Execute' }).click();
	await expect(page.getByRole('alert')).toContainText('You are offline');

	// Network emulation does not always send the browser's "online" event, so send it like a real browser would.
	await context.setOffline(false);
	await page.evaluate(() => window.dispatchEvent(new Event('online')));
	await expect(page.locator('.status-stack').getByText('You are offline')).toHaveCount(0);
});
