// Writes src/icons.css: Bootstrap Icons trimmed to the icons the site uses.
// Run after adding an icon: node scripts/build-icons-css.mjs
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync('node_modules/bootstrap-icons/font/bootstrap-icons.css', 'utf8');
const files = [];
const walk = (dir) => {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walk(p);
		else if (/\.(svelte|js|html)$/.test(e.name) && p !== 'src/icons.css') files.push(p);
	}
};
walk('src');
const code = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

// An icon counts as used when its name appears as `bi-name` or as a quoted string ('name') anywhere in src.
const used = (name) => code.includes(`bi-${name}`) || new RegExp(`['"\`]${name}['"\`]`).test(code);

const [head, ...rules] = source.split(/\n(?=\.bi-)/);
const kept = rules.filter((rule) => used(rule.match(/^\.bi-([a-z0-9-]+)::before/)[1]));
const header = head.replaceAll('url("./fonts/', 'url("../node_modules/bootstrap-icons/font/fonts/');
fs.writeFileSync('src/icons.css', `${header}\n${kept.join('\n')}\n`);
console.log(`Kept ${kept.length} of ${rules.length} icons`);
