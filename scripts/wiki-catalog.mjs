// Regenerates the wiki's Tool Catalog page and the counts on the Home page from the source of truth.
// Usage: node scripts/wiki-catalog.mjs <path-to-wiki-checkout>
import fs from 'node:fs';
import path from 'node:path';
import { categories, tools, toolsIn } from '../src/lib/tools.js';
import { agentTools } from '../src/lib/agentTools.js';
import { PROMPTS } from '../src/lib/prompts.js';

const wiki = process.argv[2];
if (!wiki || !fs.existsSync(wiki)) {
	console.error('Usage: node scripts/wiki-catalog.mjs <path-to-wiki-checkout>');
	process.exit(1);
}
const SITE = 'https://maling-it.github.io/tools';

const sections = categories.map((category) => {
	const items = toolsIn(category.id).map((tool) => `- [${tool.title}](${SITE}${tool.path}/): ${tool.description}`);
	return `## ${category.name} (${items.length})\n\n_${category.description}_\n\n${items.join('\n')}`;
});
const catalog = `# Tool Catalog

**${tools.length} tools in ${categories.length} categories.** Every tool runs in your browser. The list below is generated from \`src/lib/tools.js\`, the single source of truth, so it matches the site.

${sections.join('\n\n')}

---

Missing something? [Request a tool](https://github.com/maling-it/tools/issues/new?template=tool_request.yml).
`;
fs.writeFileSync(path.join(wiki, 'Tool-Catalog.md'), catalog);

const homeFile = path.join(wiki, 'Home.md');
const home = fs.readFileSync(homeFile, 'utf8')
	.replace(/\*\*\d+ tools in \d+ categories\*\*/, `**${tools.length} tools in ${categories.length} categories**`)
	.replace(/\| Tools \| \d+ pages in \d+ categories \|/, `| Tools | ${tools.length} pages in ${categories.length} categories |`)
	.replace(/\| Agent tools \| \d+,/, `| Agent tools | ${agentTools.length},`)
	.replace(/\| Prompt library \| \d+ prompts/, `| Prompt library | ${PROMPTS.length} prompts`);
fs.writeFileSync(homeFile, home);
console.log(`Catalog: ${tools.length} tools, ${categories.length} categories, ${agentTools.length} agent tools, ${PROMPTS.length} prompts`);
