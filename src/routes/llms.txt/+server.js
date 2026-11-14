import { categories, toolsIn } from '#lib/tools.js';
import { agentTools } from '#lib/agentTools.js';
import { REPO_URL, SITE_DESCRIPTION, SITE_URL } from '#lib/site.js';

export const prerender = true;

export function GET() {
    const lines = [
        '# Mools',
        '',
        `> ${SITE_DESCRIPTION}`,
        '',
        'Every tool is a plain web page with labeled form fields, so it can be driven by a browser agent. Data never leaves the browser.',
        '',
        '## Agent access',
        '',
        `- [Machine-readable tool list](${SITE_URL}/tools.json): all pages plus JSON Schemas for ${agentTools.length} callable tools`,
        `- [Sitemap](${SITE_URL}/sitemap.xml)`,
        `- WebMCP: in a browser that supports \`navigator.modelContext\`, the ${agentTools.length} tools are registered automatically on every page`,
        `- MCP server (stdio): clone ${REPO_URL}, run \`bun install\`, then point your MCP client at \`node mcp/server.js\``,
        ''
    ];

    for (const category of categories) {
        lines.push(`## ${category.name}`, '');
        for (const tool of toolsIn(category.id)) {
            lines.push(`- [${tool.title}](${SITE_URL}${tool.path}/): ${tool.description}`);
        }
        lines.push('');
    }

    return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
