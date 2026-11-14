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

    it('runs developer tools', async () => {
        expect(await callAgentTool('convert_base', { value: '255', from: 10, to: 16 })).toBe('ff');
        expect(await callAgentTool('roman_numeral', { value: '2024' })).toBe('MMXXIV');
        expect(JSON.parse(await callAgentTool('subnet_calculator', { cidr: '10.0.0.0/8' })).usableHosts).toBe(16777214);
        expect(await callAgentTool('convert_data_format', { text: 'a: 1', from: 'yaml', to: 'json' })).toContain('"a": 1');
        expect(await callAgentTool('chmod_calculator', { value: '755' })).toContain('rwxr-xr-x');
        expect(await callAgentTool('chmod_calculator', { value: 'rw-r--r--' })).toContain('644');
        expect(await callAgentTool('hmac_sign', { message: 'The quick brown fox jumps over the lazy dog', key: 'key' })).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
        expect(JSON.parse(await callAgentTool('http_status', { query: '418' }))[0].name).toBe("I'm a teapot");
        expect(await callAgentTool('generate_uuid', { type: 'v4', count: 3 })).toHaveLength(36 * 3 + 2);
        await expect(callAgentTool('convert_data_format', { text: 'a', from: 'xml', to: 'json' })).rejects.toThrow();
    });

    it('rejects unknown tools and missing arguments', async () => {
        await expect(callAgentTool('nope')).rejects.toThrow('Unknown tool');
        await expect(callAgentTool('base64', { text: 'x' })).rejects.toThrow('Missing required argument "mode"');
    });
});
