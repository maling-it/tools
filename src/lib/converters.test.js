import { describe, expect, it } from 'vitest';
import { base64Decode, base64Encode, csvToJson, formatJson, minifyJson, parseCsv, toVanOphuijsen } from './converters.js';

describe('csv', () => {
    it('handles quotes, embedded delimiters and newlines', () => {
        const csv = 'name,note\n"Doe, Jane","said ""hi""\nthere"\r\nBob,ok';
        expect(csvToJson(csv)).toEqual([
            { name: 'Doe, Jane', note: 'said "hi"\nthere' },
            { name: 'Bob', note: 'ok' }
        ]);
    });

    it('fills missing cells and skips blank lines', () => {
        expect(csvToJson('a,b\n1\n\n2,3')).toEqual([
            { a: '1', b: '' },
            { a: '2', b: '3' }
        ]);
    });

    it('supports custom delimiters and headerless output', () => {
        expect(csvToJson('a;b\n1;2', { delimiter: ';', header: false })).toEqual([['a', 'b'], ['1', '2']]);
    });

    it('rejects unterminated quotes', () => {
        expect(() => parseCsv('a,"b')).toThrow();
    });
});

describe('van ophuijsen', () => {
    it('converts letters in one pass and keeps casing', () => {
        expect(toVanOphuijsen('Yang jauh itu cukup')).toBe('Jang djaoeh itoe tjoekoep');
        expect(toVanOphuijsen('Nyonya Syarif Khusus')).toBe('Njonja Sjarif Choesoes');
    });
});

describe('base64', () => {
    it('round-trips unicode text', () => {
        expect(base64Decode(base64Encode('héllo 😀'))).toBe('héllo 😀');
    });

    it('supports the url-safe alphabet without padding', () => {
        const encoded = base64Encode('???>>>', { urlSafe: true });
        expect(encoded).toBe('Pz8_Pj4-');
        expect(base64Decode(encoded)).toBe('???>>>');
    });

    it('throws on invalid input', () => {
        expect(() => base64Decode('***')).toThrow();
    });
});

describe('json', () => {
    it('formats and minifies', () => {
        expect(formatJson('{"a":[1,2]}', 2)).toBe('{\n  "a": [\n    1,\n    2\n  ]\n}');
        expect(minifyJson('{ "a": [1, 2] }')).toBe('{"a":[1,2]}');
    });

    it('throws on invalid json', () => {
        expect(() => formatJson('{a:1}')).toThrow();
    });
});

import { binaryToText, csvToHtmlTable, jsonToCsv, jsonToProperties, propertiesToJson, removeStopwords, textToBinary, textToHtmlList, uniqueWords } from './converters.js';

describe('json to csv', () => {
    it('builds a union of columns and quotes cells', () => {
        expect(jsonToCsv('[{"a":1,"b":"x,y"},{"a":2,"c":true}]')).toBe('a,b,c\n1,"x,y",\n2,,true');
    });

    it('rejects non-object rows', () => {
        expect(() => jsonToCsv('[1,2]')).toThrow();
    });
});

describe('html output', () => {
    it('builds an escaped table', () => {
        expect(csvToHtmlTable('a,b\n<1>,2')).toContain('<td>&lt;1&gt;</td>');
    });

    it('builds lists', () => {
        expect(textToHtmlList('a\n\nb', { ordered: true })).toBe('<ol>\n  <li>a</li>\n  <li>b</li>\n</ol>');
    });
});

describe('properties', () => {
    it('round-trips nested data', () => {
        const json = '{"app":{"name":"x y","tags":["a","b"]}}';
        const props = jsonToProperties(json);
        expect(props).toBe('app.name=x y\napp.tags[0]=a\napp.tags[1]=b');
        expect(JSON.parse(propertiesToJson(props))).toEqual(JSON.parse(json));
    });

    it('skips comments and supports : separators and continuations', () => {
        expect(JSON.parse(propertiesToJson('# c\n! c\na:1\nb = two \\\n  three'))).toEqual({ a: '1', b: 'two three' });
    });
});

describe('binary', () => {
    it('round-trips text', () => {
        expect(textToBinary('Hi')).toBe('01001000 01101001');
        expect(binaryToText(textToBinary('héy'))).toBe('héy');
    });

    it('rejects incomplete groups', () => {
        expect(() => binaryToText('0101')).toThrow();
    });
});

describe('words', () => {
    it('removes stopwords and tidies spacing', () => {
        expect(removeStopwords('The cat is on the mat, and it is happy.')).toBe('cat mat, happy.');
    });

    it('lists unique words', () => {
        expect(uniqueWords('b A a B c')).toBe('b\na\nc');
        expect(uniqueWords('b a', { sort: true })).toBe('a\nb');
    });
});
