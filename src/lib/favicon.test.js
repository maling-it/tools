import { describe, expect, it } from 'vitest';
import { buildIco, faviconMarkup } from './favicon.js';

describe('buildIco', () => {
    it('writes a valid directory and the image data', () => {
        const a = new Uint8Array([1, 2, 3]);
        const b = new Uint8Array([4, 5]);
        const ico = buildIco([{ size: 16, data: a }, { size: 256, data: b }]);
        const view = new DataView(ico.buffer);
        expect([view.getUint16(0, true), view.getUint16(2, true), view.getUint16(4, true)]).toEqual([0, 1, 2]);
        expect([ico[6], ico[7]]).toEqual([16, 16]);
        expect([ico[22], ico[23]]).toEqual([0, 0]); // 256 is stored as 0
        expect(view.getUint32(6 + 8, true)).toBe(3);
        expect(view.getUint32(6 + 12, true)).toBe(38);
        expect([...ico.slice(38, 41)]).toEqual([1, 2, 3]);
        expect([...ico.slice(41)]).toEqual([4, 5]);
    });
    it('rejects empty input and huge sizes', () => {
        expect(() => buildIco([])).toThrow(/at least one image/);
        expect(() => buildIco([{ size: 512, data: new Uint8Array(1) }])).toThrow(/1 to 256/);
    });
});

describe('faviconMarkup', () => {
    it('uses the base path and names the app', () => {
        const { html, manifest } = faviconMarkup({ name: 'Mools', themeColor: '#0e1524', basePath: '/tools' });
        expect(html).toContain('href="/tools/favicon.ico"');
        expect(html).toContain('content="#0e1524"');
        const json = JSON.parse(manifest);
        expect(json.name).toBe('Mools');
        expect(json.icons[1].src).toBe('/tools/android-chrome-512x512.png');
    });
});
