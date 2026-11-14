import { test as base, expect } from '@playwright/test';

// Collects page errors, ignores network noise from GitHub's API and replaces its answer with a stub,
// so tests never depend on GitHub's rate limits.
export const test = base.extend({
	page: async ({ page }, use) => {
		const problems = [];
		page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
		page.on('console', (message) => {
			if (message.type() === 'error') problems.push(`console: ${message.text()}`);
		});
		page.on('requestfailed', (request) => problems.push(`request failed: ${request.url()}`));
		page.on('response', (response) => {
			if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
		});
		await page.route('https://api.github.com/**', (route) =>
			route.fulfill({ json: { html_url: 'https://github.com/maling-it/tools', stargazers_count: 3 } })
		);
		// Wait for the app to hydrate after every navigation, so keyboard shortcuts and clicks never race it.
		const goto = page.goto.bind(page);
		page.goto = async (...args) => {
			const response = await goto(...args);
			await page.locator('html[data-hydrated]').waitFor({ timeout: 10_000 }).catch(() => {});
			return response;
		};
		await use(page);
		expect(problems, 'the page should load without errors').toEqual([]);
	}
});

export { expect };
