// PDF merge and split, done in the browser with pdf-lib. Inputs and outputs are Uint8Array.

const load = async (bytes, name = 'the file') => {
    const { PDFDocument } = await import('pdf-lib');
    try {
        return await PDFDocument.load(bytes);
    } catch (error) {
        const encrypted = /encrypted/i.test(error.message);
        throw new Error(encrypted ? `${name} is password protected. Remove the password first.` : `${name} is not a PDF that can be read (${error.message.split('\n')[0]}).`);
    }
};

export const pdfPageCount = async (bytes, name) => (await load(bytes, name)).getPageCount();

/**
 * Reads a page selection such as "1-3, 5, 8-" (1-based). "8-" means up to the last page.
 * Returns the page numbers in the order written.
 */
export const parsePageRanges = (text, total) => {
    const pages = [];
    for (const part of String(text).split(/[,\s]+/).filter(Boolean)) {
        const match = part.match(/^(\d+)?(-)?(\d+)?$/);
        if (!match || (!match[1] && !match[3])) throw new Error(`"${part}" is not a page or a range. Use numbers like 1-3, 5, 8-.`);
        let from = match[1] ? Number(match[1]) : 1;
        let to = match[2] ? (match[3] ? Number(match[3]) : total) : from;
        if (!match[1] && match[2]) from = 1;
        if (from < 1 || to < 1) throw new Error('Pages start at 1.');
        if (from > total || to > total) throw new Error(`The file has ${total} ${total === 1 ? 'page' : 'pages'}, so "${part}" is out of range.`);
        if (from > to) throw new Error(`"${part}" goes backwards. Write the lower page first.`);
        for (let p = from; p <= to; p++) pages.push(p);
    }
    if (!pages.length) throw new Error('Name at least one page, for example 1-3, 5.');
    return pages;
};

/** Joins PDFs in order. files: [{ name, data }]. */
export const mergePdfs = async (files) => {
    if (files.length < 2) throw new Error('Add at least two PDF files to merge.');
    const { PDFDocument } = await import('pdf-lib');
    const out = await PDFDocument.create();
    for (const file of files) {
        const doc = await load(file.data, file.name);
        for (const page of await out.copyPages(doc, doc.getPageIndices())) out.addPage(page);
    }
    return out.save();
};

const pick = async (doc, pages) => {
    const { PDFDocument } = await import('pdf-lib');
    const out = await PDFDocument.create();
    for (const page of await out.copyPages(doc, pages.map((p) => p - 1))) out.addPage(page);
    return out.save();
};

/** A new PDF with only the chosen pages, in the order written ("3, 1-2" puts page 3 first). */
export const extractPages = async (bytes, ranges, name) => {
    const doc = await load(bytes, name);
    return pick(doc, parsePageRanges(ranges, doc.getPageCount()));
};

/**
 * Splits a PDF. mode "each": one file per page. mode "ranges": one file per group, groups separated by ";" (for example "1-3; 4-6").
 * Returns [{ name, data }] named after the source file.
 */
export const splitPdf = async (bytes, { mode = 'each', ranges = '', name = 'document.pdf' } = {}) => {
    const doc = await load(bytes, name);
    const total = doc.getPageCount();
    const stem = name.replace(/\.pdf$/i, '') || 'document';
    const width = String(total).length;
    let groups;
    if (mode === 'each') groups = Array.from({ length: total }, (_, i) => [i + 1]);
    else {
        groups = String(ranges).split(';').map((g) => g.trim()).filter(Boolean).map((g) => parsePageRanges(g, total));
        if (!groups.length) throw new Error('Write the groups to split into, for example 1-3; 4-6.');
    }
    const files = [];
    for (const [index, pages] of groups.entries()) {
        const label = mode === 'each' ? `page-${String(pages[0]).padStart(width, '0')}` : `part-${index + 1}-pages-${pages[0]}${pages.length > 1 ? `-${pages[pages.length - 1]}` : ''}`;
        files.push({ name: `${stem}-${label}.pdf`, data: await pick(doc, pages) });
    }
    return files;
};
