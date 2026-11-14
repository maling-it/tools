import { describe, expect, it } from 'vitest';
import { relatedTools, scoreTool, searchTools } from './search.js';

const tools = [
    { category: 'string', slug: 'a', title: 'HTML Escape', description: 'Escape entities' },
    { category: 'string', slug: 'b', title: 'Base64 Encode', sidebarName: 'Base64', description: 'Encode text', features: ['UTF-8'] },
    { category: 'string', slug: 'c', title: 'JSON Formatter', description: 'Prettify JSON' },
    { category: 'security', slug: 'd', title: 'Password Generator', description: 'Random passwords' }
];

describe('search', () => {
    it('ranks title matches above description matches', () => {
        expect(searchTools(tools, 'encode')[0].slug).toBe('b');
        expect(searchTools(tools, 'escape')[0].slug).toBe('a');
    });

    it('requires all words to match', () => {
        expect(searchTools(tools, 'json prettify').map((t) => t.slug)).toEqual(['c']);
        expect(searchTools(tools, 'json zzz')).toEqual([]);
    });

    it('matches categories, features and ignores accents', () => {
        expect(searchTools(tools, 'security').map((t) => t.slug)).toContain('d');
        expect(searchTools(tools, 'utf-8').map((t) => t.slug)).toEqual(['b']);
        expect(scoreTool({ title: 'Café', category: 'x' }, 'cafe')).toBeGreaterThan(0);
    });

    it('returns everything for an empty query', () => {
        expect(searchTools(tools, '  ')).toHaveLength(4);
    });
});

describe('relatedTools', () => {
    it('rotates through the same category without the current tool', () => {
        expect(relatedTools(tools, tools[0], 2).map((t) => t.slug)).toEqual(['b', 'c']);
        expect(relatedTools(tools, tools[2], 2).map((t) => t.slug)).toEqual(['a', 'b']);
        expect(relatedTools(tools, tools[3])).toEqual([]);
    });
});
