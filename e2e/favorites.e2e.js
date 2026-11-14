import { test, expect } from './fixtures.js';

test('favorites can be added, are listed everywhere and survive a reload', async ({ page }) => {
	await page.goto('/tools/string/replace-text/');
	const star = page.getByRole('button', { name: 'Add to favorites' });
	await expect(star).toHaveAttribute('aria-pressed', 'false');
	await star.click();
	await expect(page.getByRole('button', { name: 'Remove from favorites' })).toHaveAttribute('aria-pressed', 'true');

	// Sidebar group
	await expect(page.locator('#sidebar').getByText('Favorites', { exact: true })).toBeVisible();
	await expect(page.locator('#sidebar .nav-link', { hasText: 'Replace Text' }).first()).toBeVisible();

	// Home page section and the command palette
	await page.goto('/tools/');
	await expect(page.getByRole('heading', { name: 'Favorites' })).toBeVisible();
	await page.keyboard.press('Control+k');
	await expect(page.getByRole('option').first()).toContainText('Replace Text');
	await page.keyboard.press('Escape');

	// Survives a reload, then can be removed again
	await page.goto('/tools/string/replace-text/');
	await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();
	await page.getByRole('button', { name: 'Remove from favorites' }).click();
	await expect(page.getByRole('button', { name: 'Add to favorites' })).toBeVisible();
	await page.goto('/tools/');
	await expect(page.getByRole('heading', { name: 'Favorites' })).toHaveCount(0);
});

test('favorites keep their order, newest first', async ({ page }) => {
	for (const path of ['string/replace-text', 'converter/base64']) {
		await page.goto(`/tools/${path}/`);
		await page.getByRole('button', { name: 'Add to favorites' }).click();
	}
	await page.goto('/tools/');
	const titles = await page.locator('#favorites-heading + .row .card-title').allTextContents();
	expect(titles[0]).toContain('Base64');
});

test('broken storage does not break the page', async ({ page }) => {
	await page.addInitScript(() => {
		Storage.prototype.setItem = () => {
			throw new Error('blocked');
		};
	});
	await page.goto('/tools/string/replace-text/');
	await page.getByRole('button', { name: 'Add to favorites' }).click();
	await expect(page.locator('h1')).toBeVisible();
});
