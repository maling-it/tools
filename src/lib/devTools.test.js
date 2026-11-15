// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { applyLineTool, contrastRatio, convertBase, convertUnit, describeColor, describeDate, fromRoman, loremIpsum, numeronym, octalToPermissions, parseColor, parseDateInput, percentages, permissionsToOctal, permissionsToSymbolic, slugify, svgPlaceholder, textToNato, textToUnicode, toRoman, ulid, unicodeToText, uuidV4, uuidV7 } from './devUtils.js';
import { base32Decode, basicAuthHeader, bcryptCompare, bcryptHash, decodeJwt, hmac, parseUrl, passwordStrength, subnet, totp } from './netSecurity.js';
import { jsonToToml, jsonToXml, jsonToYaml, tomlToJson, tomlToYaml, yamlToJson, yamlToToml } from './formats.js';
import { explainCron, formatSql, jsonDiff, markdownToHtml, nextCronRuns, textDiff } from './formatters.js';
import { HTTP_STATUS, MIME_TYPES } from './reference.js';
import { xmlToJson } from './htmlTools.js';

describe('ids', () => {
    it('makes valid uuids and ulids', () => {
        expect(uuidV4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(uuidV7(1700000000000)).toMatch(/^018bcfe5-6800-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(ulid(1700000000000)).toMatch(/^01HF[0-9A-Z]{22}$/);
        expect(ulid()).toHaveLength(26);
    });
});

describe('text helpers', () => {
    it('slugifies', () => {
        expect(slugify('Héllo, Wörld!  2026')).toBe('hello-world-2026');
        expect(slugify('A B', { separator: '_' })).toBe('a_b');
    });
    it('generates lorem ipsum', () => {
        expect(loremIpsum({ unit: 'words', count: 4 }).split(' ')).toHaveLength(4);
        expect(loremIpsum({ unit: 'paragraphs', count: 2 }).split('\n\n')).toHaveLength(2);
        expect(loremIpsum({ unit: 'sentences', count: 2 }).startsWith('Lorem ipsum')).toBe(true);
    });
    it('converts to nato, unicode and numeronyms', () => {
        expect(textToNato('Hi 5')).toBe('Hotel India / Five');
        expect(textToUnicode('Hi😀')).toBe('U+0048 U+0069 U+1F600');
        expect(unicodeToText('U+0048 U+0069 U+1F600')).toBe('Hi😀');
        expect(unicodeToText('a\\u0041&#66;')).toBe('aAB');
        expect(numeronym('internationalization')).toBe('i18n');
    });
    it('applies line tools', () => {
        expect(applyLineTool('b\na10\na2', 'sort')).toBe('a2\na10\nb');
        expect(applyLineTool('a\nb\na', 'unique')).toBe('a\nb');
        expect(applyLineTool('a\n\n b ', 'removeEmpty')).toBe('a\n b ');
    });
});

describe('numbers and time', () => {
    it('converts bases', () => {
        expect(convertBase('255', 10, 16)).toBe('ff');
        expect(convertBase('0xFF', 16, 2)).toBe('11111111');
        expect(convertBase('-10', 10, 2)).toBe('-1010');
        expect(convertBase('9007199254740993', 10, 16)).toBe('20000000000001');
        expect(() => convertBase('12', 2, 10)).toThrow();
    });
    it('converts roman numerals', () => {
        expect(toRoman(1994)).toBe('MCMXCIV');
        expect(fromRoman('MCMXCIV')).toBe(1994);
        expect(() => fromRoman('IIII')).toThrow();
        expect(() => toRoman(4000)).toThrow();
    });
    it('parses and describes dates', () => {
        expect(parseDateInput('1700000000').toISOString()).toBe('2023-11-14T22:13:20.000Z');
        expect(parseDateInput('1700000000000').toISOString()).toBe('2023-11-14T22:13:20.000Z');
        expect(describeDate(new Date('2023-11-14T22:13:20Z'), Date.parse('2023-11-14T22:13:25Z')).relative).toBe('5 seconds ago');
        expect(() => parseDateInput('nonsense')).toThrow();
    });
    it('handles chmod', () => {
        const permissions = octalToPermissions('754');
        expect(permissionsToOctal(permissions)).toBe('754');
        expect(permissionsToSymbolic(permissions)).toBe('rwxr-xr--');
        expect(() => octalToPermissions('999')).toThrow();
    });
    it('converts units and percentages', () => {
        expect(convertUnit('length', 1, 'mi', 'km')).toBeCloseTo(1.609344);
        expect(convertUnit('temperature', 100, '°C', '°F')).toBeCloseTo(212);
        expect(convertUnit('temperature', 0, 'K', '°C')).toBeCloseTo(-273.15);
        expect(convertUnit('data', 1, 'GiB', 'MiB')).toBe(1024);
        expect(percentages({ x: 20, y: 50 })).toEqual({ percentOf: 10, isWhatPercent: 40, change: 150 });
    });
});

describe('colors', () => {
    it('parses and converts colors', () => {
        expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        expect(parseColor('rgb(30, 144, 255)')).toEqual({ r: 30, g: 144, b: 255, a: 1 });
        expect(describeColor('#1e90ff')).toEqual({ hex: '#1e90ff', rgb: 'rgb(30, 144, 255)', hsl: 'hsl(210, 100%, 56%)', cmyk: 'cmyk(88%, 44%, 0%, 0%)' });
        expect(describeColor('hsl(0, 100%, 50%)').hex).toBe('#ff0000');
        expect(() => parseColor('blue-ish')).toThrow();
    });
    it('computes contrast', () => {
        expect(contrastRatio('#000', '#fff')).toBe(21);
    });
});

describe('svg placeholder', () => {
    it('escapes the label', () => {
        expect(svgPlaceholder({ width: 10, height: 10, text: '<a>' })).toContain('&lt;a>');
    });
});

describe('security helpers', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    it('decodes a jwt without verifying it', () => {
        const jwt = decodeJwt(token);
        expect(jwt.header).toEqual({ alg: 'HS256', typ: 'JWT' });
        expect(jwt.payload.name).toBe('John Doe');
        expect(jwt.issuedAt).toBe('2018-01-18T01:30:22.000Z');
        expect(jwt.expired).toBeNull();
        expect(() => decodeJwt('abc')).toThrow();
    });
    it('builds a basic auth header', () => {
        expect(basicAuthHeader('user', 'pass')).toBe('Authorization: Basic dXNlcjpwYXNz');
    });
    it('computes hmac', async () => {
        expect(await hmac('The quick brown fox jumps over the lazy dog', 'key', 'SHA-256')).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
    });
    it('computes totp with the RFC 6238 test vector', async () => {
        const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'; // "12345678901234567890"
        expect(base32Decode(secret)).toHaveLength(20);
        expect(await totp({ secret, digits: 8, time: 59000 })).toBe('94287082');
    });
    it('rates password strength', () => {
        expect(passwordStrength('password').label).toBe('Very weak');
        expect(passwordStrength('correct-Horse-battery-staple-92!').label).toMatch(/Strong|Very strong/);
        expect(() => passwordStrength('')).toThrow();
    });
    it('hashes and compares with bcrypt', async () => {
        const hash = await bcryptHash('secret', 4);
        expect(hash).toMatch(/^\$2[aby]\$04\$/);
        expect(await bcryptCompare('secret', hash)).toBe(true);
        expect(await bcryptCompare('wrong', hash)).toBe(false);
        await expect(bcryptHash('x', 20)).rejects.toThrow();
    });
    it('parses urls', () => {
        const url = parseUrl('https://user:pw@example.com:8080/a/b?x=1&y=two#top');
        expect(url).toMatchObject({ hostname: 'example.com', port: '8080', pathname: '/a/b', hash: '#top', username: 'user' });
        expect(url.params).toEqual([['x', '1'], ['y', 'two']]);
        expect(() => parseUrl('example.com')).toThrow();
    });
    it('calculates subnets', () => {
        expect(subnet('192.168.1.130/26')).toMatchObject({ network: '192.168.1.128', broadcast: '192.168.1.191', netmask: '255.255.255.192', firstHost: '192.168.1.129', lastHost: '192.168.1.190', usableHosts: 62 });
        expect(subnet('10.0.0.1/32').totalAddresses).toBe(1);
        expect(subnet('0.0.0.0/0').totalAddresses).toBe(4294967296);
        expect(() => subnet('300.1.1.1/24')).toThrow();
    });
});

describe('format conversion', () => {
    it('converts between yaml, toml and json', () => {
        expect(JSON.parse(yamlToJson('a: 1\nb:\n  - x\n  - y'))).toEqual({ a: 1, b: ['x', 'y'] });
        expect(jsonToYaml('{"a":[1,2]}')).toBe('a:\n  - 1\n  - 2');
        expect(JSON.parse(tomlToJson('title = "x"\n[owner]\nname = "y"'))).toEqual({ title: 'x', owner: { name: 'y' } });
        expect(jsonToToml('{"a":1,"b":{"c":"d"}}')).toBe('a = 1\n\n[b]\nc = "d"');
        expect(yamlToToml('a: 1')).toBe('a = 1');
        expect(tomlToYaml('a = 1')).toBe('a: 1');
        expect(() => jsonToToml('[1]')).toThrow();
    });
    it('converts json to xml and back', () => {
        const xml = jsonToXml('{"r":{"@id":"1","i":["a","b"],"e":null}}');
        expect(xml).toContain('<r id="1">');
        expect(xml).toContain('<i>a</i>');
        expect(JSON.parse(xmlToJson(xml.replace('<?xml version="1.0" encoding="UTF-8"?>\n', '')))).toEqual({ r: { '@id': '1', i: ['a', 'b'], e: '' } });
        expect(jsonToXml('[1,2]')).toContain('<root>1</root>');
    });
});

describe('formatters', () => {
    it('formats sql and markdown', () => {
        expect(formatSql('select a from t')).toBe('SELECT\n  a\nFROM\n  t');
        expect(markdownToHtml('**hi**')).toContain('<strong>hi</strong>');
    });
    it('diffs text and json', () => {
        expect(textDiff('a\nb\n', 'a\nc\n').map((p) => p.type)).toEqual(['same', 'removed', 'added']);
        expect(jsonDiff('{"b":1,"a":2}', '{"a":2,"b":1}').every((p) => p.type === 'same')).toBe(true);
        expect(() => jsonDiff('{', '{}')).toThrow('first JSON');
    });
    it('explains cron and finds next runs', () => {
        expect(explainCron('0 9 * * 1-5')).toContain('Monday through Friday');
        expect(() => explainCron('* * *')).toThrow();
        const runs = nextCronRuns('30 8 * * *', 3, new Date(2026, 0, 1, 9, 0));
        expect(runs.map((d) => [d.getDate(), d.getHours(), d.getMinutes()])).toEqual([[2, 8, 30], [3, 8, 30], [4, 8, 30]]);
        expect(nextCronRuns('0 0 * * 7', 1, new Date(2026, 0, 1))[0].getDay()).toBe(0);
        expect(() => nextCronRuns('61 * * * *')).toThrow();
    });
});

describe('reference data', () => {
    it('has unique codes and extensions', () => {
        expect(new Set(HTTP_STATUS.map((s) => s.code)).size).toBe(HTTP_STATUS.length);
        expect(new Set(MIME_TYPES.map((m) => m.extension)).size).toBe(MIME_TYPES.length);
        expect(HTTP_STATUS.find((s) => s.code === 404).name).toBe('Not Found');
    });
});

describe('friendlier error messages in the shared libraries', () => {
    it('explainCron throws real Errors with a readable message', () => {
        let error;
        try {
            explainCron('61 * * * *');
        } catch (e) {
            error = e;
        }
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Invalid cron expression: minutes part must be >= 0 and <= 59');
    });

    it('lists the valid units and explains Roman numerals and dates', () => {
        expect(() => convertUnit('length', 1, 'kg', 'm')).toThrow('"kg" is not a length unit. Use one of: m, km');
        expect(() => convertUnit('nope', 1, 'a', 'b')).toThrow('Unknown category "nope"');
        expect(() => fromRoman('abc')).toThrow('is not a Roman numeral');
        expect(() => parseDateInput('soon')).toThrow('Could not understand "soon" as a date');
    });

    it('formats SQL errors on one line', () => {
        expect(() => formatSql('select (')).toThrow(/^Could not format the SQL: Parse error/);
    });

    it('rejects text that is not a bcrypt hash before hashing anything', async () => {
        await expect(bcryptCompare('x', 'plain text')).rejects.toThrow('does not look like a bcrypt hash');
    });
});
