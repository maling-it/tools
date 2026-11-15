import { test, expect } from './fixtures.js';

const EVIL_PATTERN = '(a+)+$';
const EVIL_TEXT = `${'a'.repeat(45)}!`;
const TIMEOUT_MESSAGE = /took too long/;

// If the main thread is blocked, evaluate never answers.
const expectResponsive = async (page) => {
	const answer = await Promise.race([page.evaluate(() => 'ok'), new Promise((resolve) => setTimeout(() => resolve('frozen'), 1500))]);
	expect(answer, 'the page should stay responsive').toBe('ok');
};

test.describe('a pattern with nested repeats does not freeze the tools', () => {
	test('Regex Tester stops it, stays usable and recovers', async ({ page }) => {
		await page.goto('/tools/string/regex-tester/');
		await page.fill('#text', EVIL_TEXT);
		await page.fill('#pattern', EVIL_PATTERN);
		await expectResponsive(page);
		await expect(page.getByRole('alert')).toContainText(TIMEOUT_MESSAGE, { timeout: 8000 });
		await expectResponsive(page);

		// A sensible pattern works again straight away.
		await page.fill('#pattern', 'a+');
		await expect(page.getByRole('heading', { name: /\d+ match/ })).toContainText('1 match');
	});

	test('Regex Tester still handles ordinary patterns', async ({ page }) => {
		await page.goto('/tools/string/regex-tester/');
		await expect(page.getByRole('heading', { name: /\d+ match/ })).toContainText('2 matches');
		await page.fill('#pattern', '(');
		await expect(page.getByRole('alert')).toContainText(/Invalid regular expression/i);
		await page.fill('#pattern', '(\\w+)@');
		await page.fill('#replacement', '<$1>@');
		await expect(page.getByText('<alice>@example.com, <bob>@test.com')).toBeVisible();
	});

	test('Replace Text stops it and keeps working', async ({ page }) => {
		await page.goto('/tools/string/replace-text/');
		await page.check('#regex-check');
		await page.fill('#find-input', EVIL_PATTERN);
		await page.fill('#replace-input', 'x');
		await page.fill('#main-textarea', EVIL_TEXT);
		await page.getByRole('button', { name: 'Replace All' }).click();
		await expectResponsive(page);
		await expect(page.getByRole('alert')).toContainText(TIMEOUT_MESSAGE, { timeout: 8000 });
		await expect(page.locator('#main-textarea')).toHaveValue(EVIL_TEXT);
		await expect(page.getByRole('button', { name: 'Replace All' })).toBeEnabled();

		await page.fill('#find-input', 'a+');
		await page.fill('#replace-input', 'b');
		await page.getByRole('button', { name: 'Replace All' }).click();
		await expect(page.locator('#main-textarea')).toHaveValue('b!');
	});

	test('Replace Text reports an invalid expression and plain search is unaffected', async ({ page }) => {
		await page.goto('/tools/string/replace-text/');
		await page.check('#regex-check');
		await page.fill('#find-input', '(');
		await page.fill('#main-textarea', 'abc');
		await page.getByRole('button', { name: 'Replace All' }).click();
		await expect(page.getByRole('alert')).toContainText('Invalid regular expression.');

		await page.uncheck('#regex-check');
		await page.fill('#find-input', 'b');
		await page.fill('#replace-input', 'X');
		await page.getByRole('button', { name: 'Replace All' }).click();
		await expect(page.locator('#main-textarea')).toHaveValue('aXc');
	});

	test('Bulk Text Transformer stops it', async ({ page }) => {
		await page.goto('/tools/bulk/bulk-text-transformer/');
		await page.selectOption('#operation', 'replace');
		await page.check('#regex');
		await page.fill('#find', EVIL_PATTERN);
		await page.fill('#replacement', 'x');
		await page.fill('#input', EVIL_TEXT);
		await expectResponsive(page);
		await expect(page.getByRole('alert')).toContainText(TIMEOUT_MESSAGE, { timeout: 12_000 });

		await page.fill('#find', '\\d');
		await page.fill('#input', 'a1\nb2');
		await expect(page.locator('.card pre').first()).toContainText('ax');
	});

	test('Bulk File Find & Replace stops it', async ({ page }) => {
		await page.goto('/tools/bulk/bulk-find-replace/');
		await page.setInputFiles('#files', [{ name: 'evil.txt', mimeType: 'text/plain', buffer: Buffer.from(EVIL_TEXT) }]);
		await page.check('#regex');
		await page.fill('#find', EVIL_PATTERN);
		await expectResponsive(page);
		await expect(page.getByRole('alert')).toContainText(TIMEOUT_MESSAGE, { timeout: 12_000 });

		await page.fill('#find', 'a+');
		await page.fill('#replacement', 'b');
		await expect(page.getByText('1 replacement in 1 file')).toBeVisible();
	});

	test('Bulk File Renamer stops it', async ({ page }) => {
		await page.goto('/tools/bulk/bulk-file-renamer/');
		await page.fill('#names', `${EVIL_TEXT}.txt`);
		await page.check('#regex');
		await page.fill('#find', EVIL_PATTERN);
		await page.fill('#replace', 'x');
		await expectResponsive(page);
		await expect(page.getByRole('alert')).toContainText(TIMEOUT_MESSAGE, { timeout: 12_000 });

		await page.fill('#names', 'IMG_1.jpg');
		await page.fill('#find', 'IMG_(\\d)');
		await page.fill('#replace', 'photo-$1');
		await expect(page.locator('tbody tr').first()).toContainText('photo-1.jpg');
	});
});
