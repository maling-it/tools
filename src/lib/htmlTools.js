// Converters that need a DOM (DOMParser); run in the browser or in jsdom for tests.

const parseHtml = (html) => new DOMParser().parseFromString(html, 'text/html');

const BLOCKS = 'p,div,section,article,header,footer,li,ul,ol,h1,h2,h3,h4,h5,h6,tr,table,blockquote,pre,hr';

export const htmlToText = (html) => {
    const doc = parseHtml(html);
    doc.querySelectorAll('script,style,noscript,template').forEach((node) => node.remove());
    doc.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
    doc.querySelectorAll(BLOCKS).forEach((node) => node.append('\n'));
    doc.querySelectorAll('td,th').forEach((node) => node.append('\t'));
    return doc.body.textContent
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

export const extractLinks = (html) =>
    [...parseHtml(html).querySelectorAll('a[href]')].map((anchor) => ({
        text: anchor.textContent.trim(),
        href: anchor.getAttribute('href')
    }));

export const htmlTablesToJson = (html) => {
    const tables = [...parseHtml(html).querySelectorAll('table')].map((table) => {
        const rows = [...table.querySelectorAll('tr')].map((row) =>
            [...row.querySelectorAll('th,td')].map((cell) => cell.textContent.trim())
        );
        const hasHeader = table.querySelector('th') !== null;
        const headers = hasHeader ? rows[0] : rows[0]?.map((_, index) => `column${index + 1}`);
        return (hasHeader ? rows.slice(1) : rows).map((row) =>
            Object.fromEntries((headers ?? []).map((name, index) => [name, row[index] ?? '']))
        );
    });
    if (tables.length === 0) throw new Error('No <table> found in the HTML.');
    return tables.length === 1 ? tables[0] : tables;
};

const elementToJson = (element) => {
    const result = {};
    for (const attribute of element.attributes) result[`@${attribute.name}`] = attribute.value;

    const children = [...element.children];
    const text = [...element.childNodes]
        .filter((node) => node.nodeType === 3 || node.nodeType === 4)
        .map((node) => node.nodeValue.trim())
        .join('')
        .trim();

    if (children.length === 0 && Object.keys(result).length === 0) return text;
    for (const child of children) {
        const value = elementToJson(child);
        const key = child.tagName;
        if (key in result) {
            result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value];
        } else {
            result[key] = value;
        }
    }
    if (text) result['#text'] = text;
    return result;
};

export const xmlToJson = (xml, indent = 2) => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const error = doc.querySelector('parsererror');
    if (error) throw new Error(`Invalid XML: ${error.textContent.split('\n')[0]}`);
    const root = doc.documentElement;
    return JSON.stringify({ [root.tagName]: elementToJson(root) }, null, indent);
};
