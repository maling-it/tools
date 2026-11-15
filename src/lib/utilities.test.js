import { describe, expect, it } from 'vitest';
import { describeMac, formatMac, generateMacs, generateRsaKeyPair, macReport, minifyCss, normalizeEmail, normalizeEmails, parseMac } from './utilities.js';

describe('normalizeEmail', () => {
    it('lowercases, removes +tags and gmail dots', () => {
        expect(normalizeEmail(' John.Doe+news@Gmail.com ').email).toBe('johndoe@gmail.com');
        expect(normalizeEmail('a.b@googlemail.com').email).toBe('ab@gmail.com');
        expect(normalizeEmail('Jane.Doe+x@Example.COM').email).toBe('jane.doe@example.com');
        expect(normalizeEmail('mailto:<a@b.co>').email).toBe('a@b.co');
    });
    it('keeps tags and dots when asked', () => {
        expect(normalizeEmail('a.b+c@gmail.com', { removeTags: false, gmailDots: false }).email).toBe('a.b+c@gmail.com');
    });
    it('explains invalid addresses', () => {
        expect(normalizeEmail('nope').reason).toMatch(/needs a name/);
        expect(normalizeEmail('a b@c.com').valid).toBe(false);
        expect(normalizeEmail('a@localhost').reason).toMatch(/domain/);
        expect(normalizeEmail('+x@b.com').reason).toMatch(/Nothing is left/);
    });
    it('de-duplicates and marks invalid lines', () => {
        expect(normalizeEmails('A@x.com, a@X.com; bad\nb+1@x.com')).toBe('a@x.com\n# Invalid: bad (An email address needs a name, an @ and a domain.)\nb@x.com');
        expect(normalizeEmails('a@x.com\na@x.com', { dedupe: false })).toBe('a@x.com\na@x.com');
    });
});

describe('MAC addresses', () => {
    it('parses every notation', () => {
        for (const text of ['00:1A:2B:3C:4D:5E', '00-1a-2b-3c-4d-5e', '001a.2b3c.4d5e', '001A2B3C4D5E']) expect(parseMac(text)).toEqual([0, 26, 43, 60, 77, 94]);
        expect(() => parseMac('00:1A')).toThrow(/12 hexadecimal digits/);
    });
    it('formats', () => {
        const bytes = parseMac('001a2b3c4d5e');
        expect(formatMac(bytes)).toBe('00:1a:2b:3c:4d:5e');
        expect(formatMac(bytes, { format: 'dot', uppercase: true })).toBe('001A.2B3C.4D5E');
        expect(formatMac(bytes, { format: 'plain' })).toBe('001a2b3c4d5e');
        expect(() => formatMac(bytes, { format: 'x' })).toThrow(/Unknown format/);
    });
    it('describes the type bits', () => {
        expect(describeMac(parseMac('01:00:5e:00:00:01')).cast).toBe('multicast');
        expect(describeMac(parseMac('02:00:00:00:00:01')).administration).toMatch(/locally/);
        expect(describeMac(parseMac('00:1a:2b:3c:4d:5e')).administration).toMatch(/universally/);
    });
    it('generates locally administered unicast addresses by default', () => {
        const macs = generateMacs(20);
        expect(macs).toHaveLength(20);
        for (const mac of macs) expect(describeMac(parseMac(mac))).toMatchObject({ cast: 'unicast', administration: 'locally administered' });
        expect(generateMacs(3, { format: 'hyphen', uppercase: true })[0]).toMatch(/^[0-9A-F]{2}(-[0-9A-F]{2}){5}$/);
        expect(describeMac(parseMac(generateMacs(1, { local: false, unicast: false })[0]))).toMatchObject({ cast: 'multicast', administration: expect.stringMatching(/universally/) });
    });
    it('reports each line', () => {
        expect(macReport('001a2b3c4d5e')).toBe('00:1A:2B:3C:4D:5E  |  00-1A-2B-3C-4D-5E  |  001a.2b3c.4d5e  |  unicast, universally administered (assigned to a manufacturer)');
    });
});

describe('generateRsaKeyPair', () => {
    it('returns PEM keys that work together', async () => {
        const { privateKey, publicKey } = await generateRsaKeyPair({ bits: 2048 });
        expect(privateKey).toMatch(/^-----BEGIN PRIVATE KEY-----\n[\s\S]+-----END PRIVATE KEY-----\n$/);
        expect(publicKey).toMatch(/^-----BEGIN PUBLIC KEY-----\n/);
        const lines = privateKey.split('\n');
        expect(lines[1].length).toBe(64);
        const { createPrivateKey, createPublicKey, createSign, createVerify } = await import('node:crypto');
        const sign = createSign('SHA256').update('hi').sign(createPrivateKey(privateKey));
        expect(createVerify('SHA256').update('hi').verify(createPublicKey(publicKey), sign)).toBe(true);
    });
    it('rejects odd sizes', async () => {
        await expect(generateRsaKeyPair({ bits: 1024 })).rejects.toThrow(/2048, 3072 or 4096/);
    });
});

describe('minifyCss', () => {
    it('removes comments and whitespace', () => {
        expect(minifyCss('/* c */\nbody {\n  margin: 0;\n  color : #ffffff;\n}\n\na > b , c { padding: 0.5em 1em; }')).toBe('body{margin:0;color:#fff}a>b,c{padding:.5em 1em}');
    });
    it('leaves strings, urls and important comments alone', () => {
        const css = `a::after { content: "a  {  b"; background: url( "x y.png" ) }\n/*! keep */ b{c:d}`;
        const out = minifyCss(css);
        expect(out).toContain('content:"a  {  b"');
        expect(out).toContain('url("x y.png")');
        expect(out).toContain('/*! keep */');
    });
    it('keeps descendant pseudo selectors and percentages', () => {
        expect(minifyCss('a :hover { x: y }')).toBe('a :hover{x:y}');
        expect(minifyCss('@keyframes k { 0% { a: 0px } 100% { a: 1px } }')).toBe('@keyframes k{0%{a:0px}100%{a:1px}}');
        expect(minifyCss('a{b:calc(100% - 0px)}')).toBe('a{b:calc(100% - 0px)}');
    });
    it('finds unbalanced braces', () => {
        expect(() => minifyCss('a { b: c')).toThrow(/not closed/);
        expect(() => minifyCss('a { b: c } }')).toThrow(/without a matching/);
        expect(() => minifyCss('a { /* x ')).toThrow(/comment is not closed/);
    });
});
