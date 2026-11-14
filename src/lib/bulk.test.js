import { describe, expect, it } from 'vitest';
import { LINE_OPERATIONS, chunkText, extractData, hashBuffer, planRename, renameScript, runBulk, splitCsv } from './bulk.js';
import { createZip, uniqueName } from './zip.js';
import { unzipSync } from 'fflate';

describe('runBulk', () => {
    it('applies an operation to each line and keeps going after errors', async () => {
        const rows = await runBulk('hello world\n%E0%A4%A\nfoo bar', 'urlDecode');
        expect(rows.map((r) => r.output)).toEqual(['hello world', '', 'foo bar']);
        expect(rows[1].error).not.toBe('');
    });

    it('supports options and async hashes', async () => {
        expect((await runBulk('a\nb', 'affix', { prefix: '<', suffix: '>' })).map((r) => r.output)).toEqual(['<a>', '<b>']);
        expect((await runBulk('hello', 'md5'))[0].output).toBe('5d41402abc4b2a76b9719d911017c592');
        expect((await runBulk('abc', 'sha1'))[0].output).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
        expect((await runBulk('Hello World', 'snake'))[0].output).toBe('hello_world');
    });

    it('handles urls and blank lines', async () => {
        const rows = await runBulk('https://www.example.com/a?utm_source=x&id=1\n\nnot a url', 'stripTracking');
        expect(rows[0].output).toBe('https://www.example.com/a?id=1');
        expect(rows[1]).toEqual({ input: '', output: '', error: '' });
        expect(rows[2].error).toBe('Not a valid URL.');
        expect((await runBulk('https://sub.example.com/x\nexample.org/y', 'domain')).map((r) => r.output)).toEqual(['sub.example.com', 'example.org']);
    });

    it('rejects unknown operations and has unique ids', async () => {
        await expect(runBulk('x', 'nope')).rejects.toThrow('Unknown operation');
        expect(new Set(LINE_OPERATIONS.map((o) => o.id)).size).toBe(LINE_OPERATIONS.length);
    });
});

describe('hashBuffer', () => {
    it('hashes bytes', async () => {
        const result = await hashBuffer(new TextEncoder().encode('abc').buffer);
        expect(result.md5).toBe('900150983cd24fb0d6963f7d28e17f72');
        expect(result.sha256).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    });
});

describe('planRename', () => {
    it('applies find/replace, prefix, case and numbering', () => {
        const plan = planRename(['My Photo.JPG', 'My Photo 2.JPG'], { find: 'My ', replace: '', caseMode: 'kebab', prefix: 'trip-', numbering: 'suffix', start: 1, pad: 2, extension: 'lower' });
        expect(plan.map((p) => p.to)).toEqual(['trip-photo_01.jpg', 'trip-photo-2_02.jpg']);
    });

    it('flags conflicts and unsafe characters', () => {
        const plan = planRename(['a.txt', 'b.txt'], { find: '[ab]', replace: 'x', regex: true });
        expect(plan.every((p) => p.conflict)).toBe(true);
        expect(planRename(['a.txt'], { prefix: 'x/y' })[0].to).toBe('x_ya.txt');
        expect(planRename(['file.txt'], { numbering: 'replace', extension: 'set', newExtension: '.md' })[0].to).toBe('1.md');
    });

    it('writes a safe shell script', () => {
        const plan = planRename(["it's.txt", 'same.txt'], { prefix: 'a-' });
        expect(renameScript(plan)).toBe("#!/bin/sh\nmv -n -- 'it'\\''s.txt' 'a-it'\\''s.txt'\nmv -n -- 'same.txt' 'a-same.txt'\n");
        expect(renameScript(planRename(['a.txt'], {}))).toBe('#!/bin/sh\n');
    });
});

describe('extractData', () => {
    const text = 'Mail jane@example.com or bob@test.org, see https://example.com/a?b=1. Also http://test.org/x and 10.0.0.1 #hello @ann 3.5 and #ff0000';
    it('extracts common data types', () => {
        expect(extractData(text, 'emails')).toEqual(['jane@example.com', 'bob@test.org']);
        expect(extractData(text, 'urls')).toEqual(['https://example.com/a?b=1', 'http://test.org/x']);
        expect(extractData(text, 'domains', { sort: true })).toEqual(['example.com', 'test.org']);
        expect(extractData(text, 'ipv4')).toEqual(['10.0.0.1']);
        expect(extractData(text, 'hashtags')).toEqual(['#hello', '#ff0000']);
        expect(extractData(text, 'mentions')).toEqual(['@ann']);
        expect(extractData(text, 'colors')).toEqual(['#ff0000']);
        expect(extractData('a 1 1 2', 'numbers')).toEqual(['1', '2']);
        expect(extractData('a 1 1 2', 'numbers', { unique: false })).toEqual(['1', '1', '2']);
    });
    it('rejects unknown kinds', () => {
        expect(() => extractData('x', 'nope')).toThrow();
    });
});

describe('chunkText', () => {
    const paragraphs = Array.from({ length: 12 }, (_, i) => `Paragraph ${i + 1}. ` + 'word '.repeat(40).trim()).join('\n\n');

    it('keeps every chunk within the budget and loses no paragraph', () => {
        const chunks = chunkText(paragraphs, { maxTokens: 120 });
        expect(chunks.length).toBeGreaterThan(2);
        expect(chunks.every((c) => c.tokens <= 120)).toBe(true);
        const joined = chunks.map((c) => c.content).join('\n\n');
        for (let i = 1; i <= 12; i++) expect(joined).toContain(`Paragraph ${i}.`);
    });

    it('splits oversized paragraphs and supports overlap', () => {
        const long = 'This is a sentence. '.repeat(200);
        const chunks = chunkText(long, { maxTokens: 50 });
        expect(chunks.every((c) => c.tokens <= 50)).toBe(true);
        const overlapped = chunkText(paragraphs, { maxTokens: 150, overlapTokens: 20 });
        expect(overlapped[1].content.startsWith('Paragraph')).toBe(false);
    });

    it('validates input', () => {
        expect(chunkText('  ')).toEqual([]);
        expect(() => chunkText('x', { maxTokens: 5 })).toThrow();
        expect(() => chunkText('x', { maxTokens: 100, overlapTokens: 100 })).toThrow();
    });
});

describe('splitCsv', () => {
    it('splits rows and repeats the header', () => {
        const parts = splitCsv('a,b\n1,2\n3,4\n5,6', { rowsPerFile: 2 });
        expect(parts).toEqual(['a,b\n1,2\n3,4', 'a,b\n5,6']);
        expect(splitCsv('1,2\n3,4\n5,6', { rowsPerFile: 2, header: false })).toEqual(['1,2\n3,4', '5,6']);
        expect(splitCsv('a,b', { rowsPerFile: 2 })).toEqual(['a,b']);
        expect(() => splitCsv('a', { rowsPerFile: 0 })).toThrow();
    });
});

describe('zip', () => {
    it('makes names unique and creates a readable archive', () => {
        const used = new Set();
        expect([uniqueName('a.png', used), uniqueName('A.png', used), uniqueName('x/y.txt', used)]).toEqual(['a.png', 'A (2).png', 'x_y.txt']);
        const zip = createZip([{ name: 'a.txt', data: new TextEncoder().encode('hello') }, { name: 'a.txt', data: new TextEncoder().encode('again') }]);
        const files = unzipSync(zip);
        expect(Object.keys(files).sort()).toEqual(['a (2).txt', 'a.txt']);
        expect(new TextDecoder().decode(files['a.txt'])).toBe('hello');
    });
});
