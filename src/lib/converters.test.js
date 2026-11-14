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
