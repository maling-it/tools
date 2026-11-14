import { describe, expect, it } from 'vitest';
import {
    caseConverters,
    escapeHtml,
    escapeJs,
    escapeXml,
    replaceText,
    textStats,
    unescapeHtml,
    unescapeJs,
    unescapeXml,
    urlDecode
} from './textUtils.js';

describe('html/xml escaping', () => {
    it('round-trips special characters', () => {
        const text = `<a href="x">'&'</a>`;
        expect(unescapeHtml(escapeHtml(text))).toBe(text);
        expect(unescapeXml(escapeXml(text))).toBe(text);
    });

    it('does not double-unescape', () => {
        expect(unescapeHtml('&amp;lt;')).toBe('&lt;');
        expect(unescapeXml('&amp;amp;')).toBe('&amp;');
    });

    it('decodes numeric entities and leaves unknown ones alone', () => {
        expect(unescapeHtml('&#65;&#x42;&unknown;')).toBe('AB&unknown;');
    });
});

describe('js escaping', () => {
    it('round-trips quotes, backslashes and control characters', () => {
        const text = 'it\'s "q" \\ \n\t<script>';
        expect(unescapeJs(escapeJs(text))).toBe(text);
    });

    it('does not escape harmless punctuation', () => {
        expect(escapeJs('a.b, (c)')).toBe('a.b, (c)');
    });

    it('decodes unicode escapes', () => {
        expect(unescapeJs('\\u0041\\x42\\u{1F600}')).toBe('AB😀');
    });
});

describe('url decoding', () => {
    it('throws on malformed input', () => {
        expect(() => urlDecode('%E0%A4%A')).toThrow();
    });
});

describe('case conversion', () => {
    it('converts between common styles', () => {
        expect(caseConverters.title('hello wORLD')).toBe('Hello World');
        expect(caseConverters.camel('hello big-world')).toBe('helloBigWorld');
        expect(caseConverters.snake('helloBigWorld')).toBe('hello_big_world');
        expect(caseConverters.kebab('Hello Big World')).toBe('hello-big-world');
        expect(caseConverters.sentence('one. two! three')).toBe('One. Two! Three');
    });
});

describe('replaceText', () => {
    it('replaces plain text literally', () => {
        expect(replaceText('a.b.c', '.', '$&')).toEqual({ text: 'a$&b$&c', count: 2 });
    });

    it('supports regex and case-insensitive matching', () => {
        expect(replaceText('Foo foo', 'foo', 'x', { caseSensitive: false }).text).toBe('x x');
        expect(replaceText('a1 b2', '([a-z])(\\d)', '$2$1', { regex: true }).text).toBe('1a 2b');
    });

    it('does nothing for an empty search', () => {
        expect(replaceText('abc', '', 'x')).toEqual({ text: 'abc', count: 0 });
    });
});

describe('textStats', () => {
    it('counts an empty string as zero', () => {
        expect(textStats('')).toMatchObject({ totalWords: 0, totalLines: 0, totalParagraphs: 0 });
    });

    it('counts words, lines and unique words', () => {
        const stats = textStats('Hello hello world.\nSecond line');
        expect(stats.totalWords).toBe(5);
        expect(stats.uniqueWords).toBe(4);
        expect(stats.totalLines).toBe(2);
    });
});
