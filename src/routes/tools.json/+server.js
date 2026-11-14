import { json } from '@sveltejs/kit';
import { categories, tools } from '#lib/tools.js';
import { agentTools } from '#lib/agentTools.js';
import { REPO_URL, SITE_DESCRIPTION, SITE_URL } from '#lib/site.js';

export const prerender = true;

export function GET() {
    return json({
        name: 'Mools',
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        repository: REPO_URL,
        categories: categories.map(({ id, name, description }) => ({ id, name, description, url: `${SITE_URL}/${id}/` })),
        pages: tools.map(({ category, slug, title, description }) => ({ slug, category, title, description, url: `${SITE_URL}/${category}/${slug}/` })),
        // JSON Schema definitions, usable with MCP, WebMCP or any function-calling API.
        tools: agentTools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
        mcp: {
            transport: 'stdio',
            command: 'node mcp/server.js',
            capabilities: ['tools', 'prompts', 'resources'],
            resources: ['mools://catalog', 'mools://prompts']
        }
    });
}
