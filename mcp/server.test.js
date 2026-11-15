import { afterEach, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from './server.js';

const closers = [];
afterEach(() => {
    while (closers.length) closers.pop()();
});

const connect = async (options) => {
    const { server, toolCount, domAvailable, close } = await createServer(options);
    closers.push(close);
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
        // Open placeholders are explained to the model.
        expect(result.messages[0].content.text).toContain('Still open: {{expected}}, {{actual}}');
        expect(result.messages[0].content.text).not.toContain('{{symptom}}, ');
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

    it('rejects invalid arguments with readable messages', async () => {
        const { client } = await connect();
        const wrongType = await client.callTool({ name: 'slugify', arguments: { text: 12345 } });
        expect(wrongType.isError).toBe(true);
        expect(wrongType.content[0].text).toBe('Argument "text" must be a string (got number).');
        const badEnum = await client.callTool({ name: 'hash_text', arguments: { text: 'x', algorithm: 'crc32' } });
        expect(badEnum.content[0].text).toContain('must be one of: md5, sha1, sha256, sha512');
        const extra = await client.callTool({ name: 'hash_text', arguments: { text: 'x', algorithm: 'md5', bogus: true } });
        expect(extra.content[0].text).toContain('Unknown argument "bogus"');
        const range = await client.callTool({ name: 'generate_password', arguments: { length: 2 } });
        expect(range.content[0].text).toContain('must be at least 4');
    });

    it('stops a runaway tool and keeps serving', async () => {
        const { client } = await connect({ timeoutMs: 1500 });
        // A regular expression with nested repeats takes exponential time on this input.
        const started = Date.now();
        const hostile = await client.callTool({ name: 'regex_test', arguments: { pattern: '(a+)+$', text: 'a'.repeat(40) + '!' } });
        expect(hostile.isError).toBe(true);
        expect(hostile.content[0].text).toContain('was stopped');
        expect(Date.now() - started).toBeLessThan(6000);
        // The worker was replaced, so the next calls work, including the DOM based ones.
        const after = await client.callTool({ name: 'base64', arguments: { text: 'hi', mode: 'encode' } });
        expect(after.content[0].text).toBe('aGk=');
        const dom = await client.callTool({ name: 'html_to_text', arguments: { html: '<p>ok</p>' } });
        expect(dom.content[0].text).toBe('ok');
    }, 20_000);

    it('answers calls made at the same time', async () => {
        const { client } = await connect();
        const results = await Promise.all(Array.from({ length: 30 }, (_, i) => client.callTool({ name: 'hash_text', arguments: { text: `job ${i}`, algorithm: 'sha256' } })));
        expect(results.every((r) => !r.isError && r.content[0].text.length === 64)).toBe(true);
    });

    it('does not add a note when every placeholder is filled in', async () => {
        const { client } = await connect();
        const full = await client.getPrompt({ name: 'security-audit', arguments: { target: 'login' } });
        expect(full.messages[0].content.text).not.toContain('Still open');
        const none = await client.getPrompt({ name: 'code-review' });
        expect(none.messages[0].content.text).not.toContain('Still open');
    });

    it('explains errors and empty results in plain words', async () => {
        const { client } = await connect();
        const bad = await client.callTool({ name: 'base64', arguments: { text: '***', mode: 'decode' } });
        expect(bad.isError).toBe(true);
        expect(bad.content[0].text).toBe('The input is not valid Base64, or it does not decode to UTF-8 text.');
        const cron = await client.callTool({ name: 'cron_explain', arguments: { expression: '61 * * * *' } });
        expect(cron.content[0].text).toBe('Invalid cron expression: minutes part must be >= 0 and <= 59');
        const none = await client.callTool({ name: 'extract_data', arguments: { text: 'nothing here', kind: 'emails' } });
        expect(none.isError).toBeFalsy();
        expect(none.content[0].text).toBe('No email addresses found.');
        const empty = await client.callTool({ name: 'slugify', arguments: { text: '!!!' } });
        expect(empty.content[0].text).toBe('(The result is empty.)');
    });
});

