#!/usr/bin/env node
// Mools MCP server: exposes the Mools tools, prompt library and catalog over stdio so agents can use them directly.
// Run with `node mcp/server.js` (or `bun mcp/server.js`).
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    GetPromptRequestSchema,
    ListPromptsRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { agentTools, callAgentTool } from '../src/lib/agentTools.js';
import { PROMPTS } from '../src/lib/prompts.js';
import { categories, tools as pages } from '../src/lib/tools.js';
import { extractVariables, fillTemplate } from '../src/lib/vibe.js';
import { SITE_URL } from '../src/lib/site.js';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// A few tools parse HTML or XML and need DOMParser. Node has none, so borrow jsdom's when it is installed.
const enableDomTools = async () => {
    try {
        const { JSDOM } = await import('jsdom');
        globalThis.DOMParser = new JSDOM('').window.DOMParser;
        return true;
    } catch {
        return false;
    }
};

const titleOf = (name) => name.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const RESOURCES = [
    {
        uri: 'mools://catalog',
        name: 'Mools tool catalog',
        description: 'Every Mools web tool with its category, description and URL.',
        mimeType: 'application/json',
        read: () => JSON.stringify({ site: SITE_URL, categories: categories.map(({ id, name, description }) => ({ id, name, description })), tools: pages.map(({ category, slug, title, description }) => ({ category, slug, title, description, url: `${SITE_URL}/${category}/${slug}/` })) }, null, 2)
    },
    {
        uri: 'mools://prompts',
        name: 'Mools prompt library',
        description: 'Prompts for AI-assisted coding, with their {{placeholders}}.',
        mimeType: 'application/json',
        read: () => JSON.stringify(PROMPTS.map((p) => ({ id: p.id, title: p.title, category: p.category, placeholders: extractVariables(p.prompt), prompt: p.prompt })), null, 2)
    }
];

export const createServer = async () => {
    const domAvailable = await enableDomTools();
    const tools = agentTools.filter((tool) => domAvailable || !tool.dom);

    const server = new Server(
        { name: 'mools', version },
        {
            capabilities: { tools: {}, prompts: {}, resources: {} },
            instructions:
                'Mools offers small, deterministic developer utilities (encoding, converters, hashes, generators, calculators, formatters). Everything runs locally and no data is sent anywhere. Tool results are plain text, usually ready to paste. Use the prompts for common AI-assisted coding workflows.'
        }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: tools.map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema,
            annotations: { title: titleOf(name), readOnlyHint: true, destructiveHint: false, idempotentHint: !/password|uuid|bcrypt|lorem|team|business/.test(name), openWorldHint: false }
        }))
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        if (!tools.some((tool) => tool.name === name)) {
            return { isError: true, content: [{ type: 'text', text: `Unknown tool "${name}".` }] };
        }
        try {
            return { content: [{ type: 'text', text: await callAgentTool(name, args ?? {}) }] };
        } catch (error) {
            return { isError: true, content: [{ type: 'text', text: error.message }] };
        }
    });

    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
        prompts: PROMPTS.map((p) => ({
            name: p.id,
            title: p.title,
            description: `${p.category}: ${p.title}`,
            arguments: extractVariables(p.prompt).map((name) => ({ name, description: `Replaces {{${name}}} in the prompt`, required: false }))
        }))
    }));

    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const prompt = PROMPTS.find((p) => p.id === request.params.name);
        if (!prompt) throw new Error(`Unknown prompt "${request.params.name}".`);
        return {
            description: prompt.title,
            messages: [{ role: 'user', content: { type: 'text', text: fillTemplate(prompt.prompt, request.params.arguments ?? {}) } }]
        };
    });

    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: RESOURCES.map(({ uri, name, description, mimeType }) => ({ uri, name, description, mimeType }))
    }));

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const resource = RESOURCES.find((r) => r.uri === request.params.uri);
        if (!resource) throw new Error(`Unknown resource "${request.params.uri}".`);
        return { contents: [{ uri: resource.uri, mimeType: resource.mimeType, text: resource.read() }] };
    });

    return { server, toolCount: tools.length, domAvailable };
};

// Start on stdio only when run directly, so tests can import createServer.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const { server } = await createServer();
    await server.connect(new StdioServerTransport());
}
