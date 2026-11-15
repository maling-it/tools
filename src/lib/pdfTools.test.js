import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { extractPages, mergePdfs, parsePageRanges, pdfPageCount, splitPdf } from './pdfTools.js';

// A PDF whose pages have different widths (100, 101, ...), so the order of pages can be checked.
const makePdf = async (pages, start = 100) => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pages; i++) doc.addPage([start + i, 200]);
    return doc.save();
};
const widths = async (bytes) => (await PDFDocument.load(bytes)).getPages().map((p) => p.getWidth());

describe('parsePageRanges', () => {
    it('reads pages, ranges and open ends', () => {
        expect(parsePageRanges('1-3, 5, 8-', 9)).toEqual([1, 2, 3, 5, 8, 9]);
        expect(parsePageRanges('-2', 5)).toEqual([1, 2]);
        expect(parsePageRanges('3 1', 5)).toEqual([3, 1]);
    });
    it('explains mistakes', () => {
        expect(() => parsePageRanges('x', 5)).toThrow(/not a page or a range/);
        expect(() => parsePageRanges('6', 5)).toThrow(/has 5 pages, so "6" is out of range/);
        expect(() => parsePageRanges('4-2', 5)).toThrow(/backwards/);
        expect(() => parsePageRanges('0', 5)).toThrow(/start at 1/);
        expect(() => parsePageRanges('', 5)).toThrow(/at least one page/);
    });
});

describe('PDF tools', () => {
    it('merges in order', async () => {
        const merged = await mergePdfs([
            { name: 'a.pdf', data: await makePdf(2, 100) },
            { name: 'b.pdf', data: await makePdf(1, 300) }
        ]);
        expect(await widths(merged)).toEqual([100, 101, 300]);
    });
    it('needs two files and readable PDFs', async () => {
        await expect(mergePdfs([{ name: 'a.pdf', data: await makePdf(1) }])).rejects.toThrow(/at least two/);
        await expect(mergePdfs([{ name: 'a.pdf', data: await makePdf(1) }, { name: 'bad.pdf', data: new Uint8Array([1, 2, 3]) }])).rejects.toThrow(/bad\.pdf is not a PDF/);
    });
    it('extracts pages in the order written', async () => {
        const out = await extractPages(await makePdf(5), '4, 1-2');
        expect(await widths(out)).toEqual([103, 100, 101]);
        await expect(extractPages(await makePdf(2), '3')).rejects.toThrow(/out of range/);
    });
    it('splits into one file per page, with sortable names', async () => {
        const files = await splitPdf(await makePdf(10), { name: 'report.pdf' });
        expect(files).toHaveLength(10);
        expect(files[0].name).toBe('report-page-01.pdf');
        expect(files[9].name).toBe('report-page-10.pdf');
        expect(await widths(files[2].data)).toEqual([102]);
    });
    it('splits into groups', async () => {
        const files = await splitPdf(await makePdf(6), { mode: 'ranges', ranges: '1-3; 4; 5-6', name: 'a.pdf' });
        expect(files.map((f) => f.name)).toEqual(['a-part-1-pages-1-3.pdf', 'a-part-2-pages-4.pdf', 'a-part-3-pages-5-6.pdf']);
        expect(await widths(files[0].data)).toEqual([100, 101, 102]);
        await expect(splitPdf(await makePdf(2), { mode: 'ranges', ranges: ' ; ' })).rejects.toThrow(/groups/);
    });
    it('counts pages', async () => {
        expect(await pdfPageCount(await makePdf(7))).toBe(7);
    });
});
