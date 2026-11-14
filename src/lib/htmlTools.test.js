// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { extractLinks, htmlTablesToJson, htmlToText, xmlToJson } from './htmlTools.js';

describe('html tools', () => {
    it('strips tags and keeps block structure', () => {
        expect(htmlToText('<h1>Hi</h1><p>one<br>two</p><script>x()</script>')).toBe('Hi\none\ntwo');
    });

    it('extracts links', () => {
        expect(extractLinks('<a href="/a">A</a><a>no</a><a href="b">B</a>')).toEqual([
            { text: 'A', href: '/a' },
            { text: 'B', href: 'b' }
        ]);
    });

    it('converts tables using header cells', () => {
        const html = '<table><tr><th>n</th><th>v</th></tr><tr><td>a</td><td>1</td></tr></table>';
        expect(htmlTablesToJson(html)).toEqual([{ n: 'a', v: '1' }]);
        expect(() => htmlTablesToJson('<p>x</p>')).toThrow();
    });

    it('converts xml with attributes and repeated elements', () => {
        const json = JSON.parse(xmlToJson('<r id="1"><i>a</i><i>b</i><e/></r>'));
        expect(json).toEqual({ r: { '@id': '1', i: ['a', 'b'], e: '' } });
        expect(() => xmlToJson('<a>')).toThrow();
    });
});
