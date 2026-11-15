// Measures what each page loads eagerly (JS preloads + CSS, gzipped) from the built site and checks budgets.
// Usage: node scripts/bundle-budget.mjs [--all]   (run after `bun run build`)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const BUILD = 'build';
const KB = 1024;
// Budgets in gzipped KB. Raise them on purpose, not by accident.
const BUDGETS = { 'index.html': { js: 75, css: 55 }, 'converter/json-formatter/index.html': { js: 80, css: 55 }, default: { js: 175, css: 55 } };

const gz = (file) => zlib.gzipSync(fs.readFileSync(path.join(BUILD, file))).length;
const pages = [];
const walk = (dir) => {
	for (const entry of fs.readdirSync(path.join(BUILD, dir), { withFileTypes: true })) {
		const rel = path.join(dir, entry.name);
		if (entry.isDirectory()) { if (!rel.startsWith('_app')) walk(rel); }
		else if (entry.name === 'index.html') pages.push(rel);
	}
};
walk('');

const rows = pages.map((page) => {
	const html = fs.readFileSync(path.join(BUILD, page), 'utf8');
	const files = (re) => [...new Set([...html.matchAll(re)].map((m) => path.normalize(path.join(path.dirname(page), m[1]))))];
	const js = files(/<link href="([^"]+\.js)" rel="modulepreload">/g);
	const css = files(/<link href="([^"]+\.css)" rel="stylesheet">/g);
	const sum = (list) => list.reduce((n, f) => n + gz(f), 0);
	return { page, js: sum(js) / KB, css: sum(css) / KB, html: zlib.gzipSync(html).length / KB };
});

rows.sort((a, b) => b.js - a.js);
const show = process.argv.includes('--all') ? rows : rows.slice(0, 8);
console.log('page'.padEnd(46), 'js KB'.padStart(8), 'css KB'.padStart(8), 'html KB'.padStart(8));
for (const r of show) console.log(r.page.padEnd(46), r.js.toFixed(1).padStart(8), r.css.toFixed(1).padStart(8), r.html.toFixed(1).padStart(8));
console.log(`${rows.length} pages, median JS ${rows[Math.floor(rows.length / 2)].js.toFixed(1)} KB`);

const failures = rows.flatMap((r) => {
	const b = BUDGETS[r.page] ?? BUDGETS.default;
	return ['js', 'css'].filter((k) => r[k] > b[k]).map((k) => `${r.page}: ${k} ${r[k].toFixed(1)} KB > ${b[k]} KB`);
});
if (failures.length) { console.error('\nOver budget:\n' + failures.join('\n')); process.exit(1); }
console.log('All pages within budget.');
