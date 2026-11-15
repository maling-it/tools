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
import { agentTools } from '../src/lib/agentTools.js';
import { createRunner } from './runner.js';
import { PROMPTS } from '../src/lib/prompts.js';
import { categories, tools as pages } from '../src/lib/tools.js';
import { extractVariables, fillTemplate } from '../src/lib/vibe.js';
import { SITE_URL } from '../src/lib/site.js';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// A few tools parse HTML or XML and need a DOM. The worker thread that runs the tools provides one through jsdom;
// when jsdom is not installed those tools are simply not offered.
const jsdomAvailable = async () => {
    try {
        await import('jsdom');
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

export const createServer = async ({ timeoutMs = 15_000 } = {}) => {
    const domAvailable = await jsdomAvailable();
    const runner = createRunner({ timeoutMs });
    runner.warmUp();
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
        const result = await runner.run(name, args ?? {});
        return result.ok
            ? { content: [{ type: 'text', text: result.text }] }
            : { isError: true, content: [{ type: 'text', text: result.error }] };
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
        let text = fillTemplate(prompt.prompt, request.params.arguments ?? {});
        // Clients such as Claude Code pass one word per argument, so most placeholders usually stay open.
        // Tell the model how to treat them instead of leaving it to guess.
        const open = extractVariables(text);
        if (open.length) {
            text += `\n\n(Still open: ${open.map((name) => `{{${name}}}`).join(', ')}. Take these from what the user tells you in this conversation, and ask when you are unsure; do not invent them.)`;
        }
        return { description: prompt.title, messages: [{ role: 'user', content: { type: 'text', text } }] };
    });

    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: RESOURCES.map(({ uri, name, description, mimeType }) => ({ uri, name, description, mimeType }))
    }));

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const resource = RESOURCES.find((r) => r.uri === request.params.uri);
        if (!resource) throw new Error(`Unknown resource "${request.params.uri}".`);
        return { contents: [{ uri: resource.uri, mimeType: resource.mimeType, text: resource.read() }] };
    });

    return { server, toolCount: tools.length, domAvailable, close: () => runner.close() };
};

// Start on stdio only when run directly, so tests can import createServer.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const { server } = await createServer();
    await server.connect(new StdioServerTransport());
}
