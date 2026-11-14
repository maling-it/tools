import { describe, expect, it } from 'vitest';
import { agentTools, callAgentTool } from './agentTools.js';

describe('agent tools', () => {
    it('has unique snake_case names and valid schemas', () => {
        const names = agentTools.map((tool) => tool.name);
        expect(new Set(names).size).toBe(names.length);
        for (const tool of agentTools) {
            expect(tool.name).toMatch(/^[a-z][a-z0-9_]*$/);
            expect(tool.description.length).toBeGreaterThan(10);
            expect(tool.inputSchema.type).toBe('object');
            for (const key of tool.inputSchema.required) expect(tool.inputSchema.properties).toHaveProperty(key);
        }
    });

    it('runs text tools', async () => {
        expect(await callAgentTool('html_escape', { text: '<b>', mode: 'escape' })).toBe('&lt;b&gt;');
        expect(await callAgentTool('change_case', { text: 'hello world', style: 'snake' })).toBe('hello_world');
        expect(await callAgentTool('base64', { text: 'hi', mode: 'encode' })).toBe('aGk=');
        expect(await callAgentTool('hash_text', { text: 'hello', algorithm: 'md5' })).toBe('5d41402abc4b2a76b9719d911017c592');
        expect(JSON.parse(await callAgentTool('csv_to_json', { csv: 'a,b\n1,2' }))).toEqual([{ a: '1', b: '2' }]);
    });

    it('runs calculators and generators', async () => {
        expect(JSON.parse(await callAgentTool('cap_rate', { price: 100, income: 20, expenses: 10 }))).toEqual({ noi: 10, capRate: 10 });
        expect(await callAgentTool('generate_password', { length: 20 })).toHaveLength(20);
        expect(await callAgentTool('qr_code_svg', { text: 'hi' })).toContain('<svg');
    });

    it('rejects unknown tools and missing arguments', async () => {
        await expect(callAgentTool('nope')).rejects.toThrow('Unknown tool');
        await expect(callAgentTool('base64', { text: 'x' })).rejects.toThrow('Missing required argument "mode"');
    });
});
