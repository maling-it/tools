import { describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from './server.js';

const connect = async () => {
    const { server, toolCount, domAvailable } = await createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: 'test', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    return { client, toolCount, domAvailable };
};

describe('mools mcp server', () => {
    it('announces its capabilities and instructions', async () => {
        const { client } = await connect();
        const capabilities = client.getServerCapabilities();
        expect(capabilities).toHaveProperty('tools');
        expect(capabilities).toHaveProperty('prompts');
        expect(capabilities).toHaveProperty('resources');
        expect(client.getServerVersion().name).toBe('mools');
        expect(client.getInstructions()).toContain('Mools');
    });

    it('lists tools with annotations, including DOM tools when jsdom is available', async () => {
        const { client, toolCount, domAvailable } = await connect();
        const { tools } = await client.listTools();
        expect(tools).toHaveLength(toolCount);
        expect(tools.every((t) => t.annotations.readOnlyHint === true)).toBe(true);
        expect(tools.some((t) => t.name === 'html_to_text')).toBe(domAvailable);
        expect(domAvailable).toBe(true);
    });

    it('calls tools, including DOM based ones, and reports errors', async () => {
        const { client } = await connect();
        const ok = await client.callTool({ name: 'base64', arguments: { text: 'hi', mode: 'encode' } });
        expect(ok.content[0].text).toBe('aGk=');
        const dom = await client.callTool({ name: 'html_to_text', arguments: { html: '<h1>Hello</h1><p>World</p>' } });
        expect(dom.content[0].text).toBe('Hello\nWorld');
        const bad = await client.callTool({ name: 'base64', arguments: { text: '***', mode: 'decode' } });
        expect(bad.isError).toBe(true);
        const missing = await client.callTool({ name: 'nope', arguments: {} });
        expect(missing.isError).toBe(true);
    });

    it('serves the prompt library as MCP prompts', async () => {
        const { client } = await connect();
        const { prompts } = await client.listPrompts();
        const bug = prompts.find((p) => p.name === 'fix-bug');
        expect(bug.arguments.map((a) => a.name)).toEqual(['symptom', 'expected', 'actual']);
        const result = await client.getPrompt({ name: 'fix-bug', arguments: { symptom: 'login crashes' } });
        expect(result.messages[0].role).toBe('user');
        expect(result.messages[0].content.text).toContain('login crashes');
        expect(result.messages[0].content.text).toContain('{{expected}}');
        await expect(client.getPrompt({ name: 'nope' })).rejects.toThrow();
    });

    it('serves resources', async () => {
        const { client } = await connect();
        const { resources } = await client.listResources();
        expect(resources.map((r) => r.uri)).toEqual(['mools://catalog', 'mools://prompts']);
        const catalog = await client.readResource({ uri: 'mools://catalog' });
        expect(JSON.parse(catalog.contents[0].text).tools.length).toBeGreaterThan(100);
        await expect(client.readResource({ uri: 'mools://nope' })).rejects.toThrow();
    });
});
