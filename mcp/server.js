#!/usr/bin/env node
// Mools MCP server: exposes the Mools tools over stdio so agents can call them directly.
// Run with `bun mcp/server.js` (or `node mcp/server.js`).
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { agentTools, callAgentTool } from '../src/lib/agentTools.js';

// Tools that need a browser DOM are only offered on the website (WebMCP).
const tools = agentTools.filter((tool) => !tool.dom);

const server = new Server({ name: 'mools', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }))
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

await server.connect(new StdioServerTransport());
