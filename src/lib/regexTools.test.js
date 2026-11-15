import { describe, expect, it } from 'vitest';
import { REGEX_JOB_TYPES, handleRegexJob, regexMatches, replaceInDocuments } from './regexTools.js';

describe('regexMatches', () => {
    it('lists matches with groups and named groups', () => {
        const { matches } = regexMatches({ pattern: '(?<user>\\w+)@(\\w+)\\.com', text: 'alice@example.com, bob@test.com' });
        expect(matches).toHaveLength(2);
        expect(matches[0]).toMatchObject({ text: 'alice@example.com', index: 0, groups: ['alice', 'example'] });
        expect(matches[0].named).toEqual({ user: 'alice' });
        expect(matches[1].index).toBe(19);
    });

    it('applies the replacement and always matches globally', () => {
        const { matches, replaced } = regexMatches({ pattern: '(a)(b)', flags: 'i', text: 'ab AB', replacement: '$2$1' });
        expect(matches).toHaveLength(2);
        expect(replaced).toBe('ba AB'); // without the g flag only the first match is replaced
    });

    it('returns nothing for an empty pattern and throws for an invalid one', () => {
        expect(regexMatches({ pattern: '', text: 'x' })).toEqual({ matches: [], replaced: '' });
        expect(() => regexMatches({ pattern: '(', text: 'x' })).toThrow(/Invalid regular expression/);
    });

    it('caps the number of matches', () => {
        expect(regexMatches({ pattern: 'a', text: 'a'.repeat(1000), limit: 10 }).matches).toHaveLength(10);
    });
});

describe('handleRegexJob', () => {
    it('runs every job type', async () => {
        expect(new Set(REGEX_JOB_TYPES)).toEqual(new Set(['matches', 'replace', 'replaceDocuments', 'bulkLines', 'renamePlan']));
        expect(await handleRegexJob({ type: 'replace', text: 'cat cat', find: 'c(a)t', replacement: 'dog', options: { regex: true } })).toEqual({ text: 'dog dog', count: 2 });
        expect(await handleRegexJob({ type: 'replaceDocuments', docs: [{ name: 'a.txt', text: 'x1 x2' }, { name: 'b.txt', text: 'none' }], find: 'x\\d', replacement: 'y', options: { regex: true } })).toEqual([
            { name: 'a.txt', out: 'y y', count: 2 },
            { name: 'b.txt', out: 'none', count: 0 }
        ]);
        const rows = await handleRegexJob({ type: 'bulkLines', text: 'a1\nb2', operation: 'replace', options: { find: '\\d', replacement: '#', regex: true } });
        expect(rows.map((r) => r.output)).toEqual(['a#', 'b#']);
        const plan = await handleRegexJob({ type: 'renamePlan', names: ['IMG_1.jpg'], rules: { find: 'IMG_(\\d)', replace: 'photo-$1', regex: true } });
        expect(plan[0].to).toBe('photo-1.jpg');
    });

    it('rejects unknown jobs and invalid patterns', async () => {
        await expect(handleRegexJob({ type: 'nope' })).rejects.toThrow('Unknown regex job');
        await expect(handleRegexJob({ type: 'replace', text: 'x', find: '(', replacement: '', options: { regex: true } })).rejects.toThrow();
    });
});

describe('replaceInDocuments', () => {
    it('counts replacements per document', () => {
        expect(replaceInDocuments([{ name: 'a', text: 'aa' }], 'a', 'b')).toEqual([{ name: 'a', out: 'bb', count: 2 }]);
    });
});
