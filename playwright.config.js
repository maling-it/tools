import { defineConfig } from '@playwright/test';

// The tests drive the production build, so run `bun run build` first (the CI workflow does).
// They use the Google Chrome that is installed on the machine; set CHROME_PATH to use another browser.
export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.js',
	fullyParallel: true,
	workers: process.env.CI ? 2 : 4,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['list'], ['github']] : 'list',
	use: {
		baseURL: 'http://localhost:4173',
		acceptDownloads: true,
		trace: 'retain-on-failure',
		...(process.env.CHROME_PATH ? { launchOptions: { executablePath: process.env.CHROME_PATH } } : { channel: 'chrome' })
	},
	webServer: {
		command: 'bun run preview --port 4173 --strictPort',
		url: 'http://localhost:4173/tools/',
		reuseExistingServer: !process.env.CI,
		timeout: 60_000
	}
});
