import fs from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { unzipSync } from 'fflate';
import { test, expect } from './fixtures.js';

// A PDF whose pages are 100, 101, ... points wide, so the page order can be checked.
const makePdf = async (pages, start = 100) => {
	const doc = await PDFDocument.create();
	for (let i = 0; i < pages; i++) doc.addPage([start + i, 200]);
	return Buffer.from(await doc.save());
};
const widths = async (bytes) => (await PDFDocument.load(bytes)).getPages().map((p) => p.getWidth());
const read = async (download) => new Uint8Array(fs.readFileSync(await download.path()));

test('PDF Merge joins files in the chosen order', async ({ page }) => {
	await page.goto('/tools/converter/pdf-merge/');
	await page.setInputFiles('#pdf-files', [
		{ name: 'a.pdf', mimeType: 'application/pdf', buffer: await makePdf(2, 100) },
		{ name: 'b.pdf', mimeType: 'application/pdf', buffer: await makePdf(1, 300) }
	]);
	await page.getByRole('button', { name: 'Move b.pdf up' }).click();
	await page.getByRole('button', { name: 'Merge PDFs' }).click();
	const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: /Download merged.pdf \(3 pages\)/ }).click()]);
	expect(await widths(await read(download))).toEqual([300, 100, 101]);
});

test('PDF Merge explains a file that is not a PDF', async ({ page }) => {
	await page.goto('/tools/converter/pdf-merge/');
	await page.setInputFiles('#pdf-files', [
		{ name: 'a.pdf', mimeType: 'application/pdf', buffer: await makePdf(1) },
		{ name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf') }
	]);
	await page.getByRole('button', { name: 'Merge PDFs' }).click();
	await expect(page.getByRole('alert')).toContainText('notes.pdf is not a PDF');
});

test('PDF Split keeps the chosen pages and splits into a ZIP', async ({ page }) => {
	await page.goto('/tools/converter/pdf-split/');
	await page.setInputFiles('#split-file', { name: 'doc.pdf', mimeType: 'application/pdf', buffer: await makePdf(6) });
	await expect(page.getByText('doc.pdf has 6 pages.')).toBeVisible();

	await page.fill('#split-ranges', '9');
	await page.getByRole('button', { name: 'Extract pages' }).click();
	await expect(page.getByRole('alert')).toContainText('has 6 pages, so "9" is out of range');

	await page.fill('#split-ranges', '4, 1-2');
	let [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Extract pages' }).click()]);
	expect(download.suggestedFilename()).toBe('doc-selected.pdf');
	expect(await widths(await read(download))).toEqual([103, 100, 101]);

	await page.getByLabel('One file per page (ZIP of PDFs)').check();
	[download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Split' }).click()]);
	expect(Object.keys(unzipSync(await read(download))).sort()).toEqual(['doc-page-1.pdf', 'doc-page-2.pdf', 'doc-page-3.pdf', 'doc-page-4.pdf', 'doc-page-5.pdf', 'doc-page-6.pdf']);
});

test('Favicon Generator makes a ZIP with an ICO, PNG sizes, manifest and head HTML', async ({ page }) => {
	await page.goto('/tools/generator/favicon-generator/');
	const png = fs.readFileSync('static/icons/icon-512.png');
	await page.setInputFiles('#fav-file', { name: 'logo.png', mimeType: 'image/png', buffer: png });
	await page.fill('#fav-name', 'Test App');
	await page.fill('#fav-base', '/app');
	const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download ZIP' }).click()]);
	const files = unzipSync(await read(download));
	expect(Object.keys(files).sort()).toEqual(['android-chrome-192x192.png', 'android-chrome-512x512.png', 'apple-touch-icon.png', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-48x48.png', 'favicon.ico', 'head.html', 'site.webmanifest']);
	const ico = new DataView(files['favicon.ico'].buffer, files['favicon.ico'].byteOffset);
	expect([ico.getUint16(2, true), ico.getUint16(4, true)]).toEqual([1, 3]);
	expect(JSON.parse(new TextDecoder().decode(files['site.webmanifest'])).name).toBe('Test App');
	expect(new TextDecoder().decode(files['head.html'])).toContain('href="/app/favicon.ico"');
	// The 192 pixel icon really is a 192 pixel PNG: the width sits at byte 16 of the IHDR chunk.
	expect(new DataView(files['android-chrome-192x192.png'].buffer, files['android-chrome-192x192.png'].byteOffset).getUint32(16)).toBe(192);
});
