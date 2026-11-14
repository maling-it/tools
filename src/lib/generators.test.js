import { describe, expect, it } from 'vitest';
import { averageCost, capRate, concrete, dirt, formatMinutes, parseTradeLines, workMinutes } from './calculators.js';
import { buildAffiliateLink, buildHtmlLink, buildMetaTags, generatePassword, makeTitles, md5, memorablePassword, shaHash, teamNames } from './generators.js';

describe('passwords', () => {
    it('respects length and character sets', () => {
        const password = generatePassword({ length: 24, symbols: false, digits: true });
        expect(password).toHaveLength(24);
        expect(password).toMatch(/[a-z]/);
        expect(password).toMatch(/[A-Z]/);
        expect(password).toMatch(/\d/);
        expect(password).not.toMatch(/[^A-Za-z0-9]/);
    });

    it('rejects impossible settings', () => {
        expect(() => generatePassword({ lower: false, upper: false, digits: false, symbols: false })).toThrow();
        expect(() => generatePassword({ length: 2 })).toThrow();
    });

    it('builds memorable passwords', () => {
        expect(memorablePassword({ words: 3, separator: '.', addNumber: false }).split('.')).toHaveLength(3);
    });
});

describe('hashes', () => {
    it('matches known digests', async () => {
        expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
        expect(await shaHash('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
    });
});

describe('seo and links', () => {
    it('makes titles and meta tags', () => {
        expect(makeTitles('SEO', { year: 2030 })[0]).toContain('SEO');
        expect(makeTitles('  ')).toEqual([]);
        expect(buildMetaTags({ title: 'A "b"', description: 'd' })).toContain('<title>A &quot;b&quot;</title>');
    });

    it('builds html and affiliate links', () => {
        expect(buildHtmlLink({ url: 'https://x.dev', text: 'X', newTab: true })).toBe('<a href="https://x.dev" target="_blank" rel="noopener noreferrer">X</a>');
        expect(buildAffiliateLink({ store: 'amazon', id: 'b08n5wrwnw', tag: 'me-20' })).toBe('https://www.amazon.com/dp/B08N5WRWNW?tag=me-20');
        expect(() => buildAffiliateLink({ store: 'audible', id: 'bad', tag: '' })).toThrow();
    });

    it('generates unique team names', () => {
        const names = teamNames(8);
        expect(new Set(names).size).toBe(8);
    });
});

describe('calculators', () => {
    it('computes concrete volume', () => {
        const result = concrete({ length: 10, width: 10, depth: 4, wastePercent: 0 });
        expect(result.cubicYards).toBeCloseTo(1.235, 2);
        expect(result.bags80).toBe(56);
    });

    it('computes dirt', () => {
        expect(dirt({ length: 9, width: 9, depth: 4 }).cubicYards).toBeCloseTo(1, 1);
    });

    it('computes cap rate', () => {
        expect(capRate({ price: 200000, income: 30000, expenses: 10000 })).toEqual({ noi: 20000, capRate: 10 });
        expect(() => capRate({ price: 0, income: 1 })).toThrow();
    });

    it('averages crypto purchases', () => {
        const result = averageCost(parseTradeLines('amount,price\n1,100\n3,200'));
        expect(result).toEqual({ totalAmount: 4, totalCost: 700, average: 175 });
        expect(() => parseTradeLines('1,2\nx')).toThrow();
    });

    it('computes work hours including overnight shifts', () => {
        expect(workMinutes('09:00', '17:30', 30)).toBe(480);
        expect(workMinutes('22:00', '06:00')).toBe(480);
        expect(formatMinutes(485)).toBe('8h 05m');
    });
});
