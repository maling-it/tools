// Format converters

// RFC 4180 style parser: quoted fields, escaped quotes, embedded delimiters and newlines.
export const parseCsv = (text, delimiter = ',') => {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;

    const source = text.replace(/^﻿/, '');

    for (let i = 0; i < source.length; i++) {
        const char = source[i];

        if (quoted) {
            if (char === '"' && source[i + 1] === '"') {
                field += '"';
                i++;
            } else if (char === '"') {
                quoted = false;
            } else {
                field += char;
            }
        } else if (char === '"' && field === '') {
            quoted = true;
        } else if (char === delimiter) {
            row.push(field);
            field = '';
        } else if (char === '\n' || char === '\r') {
            if (char === '\r' && source[i + 1] === '\n') i++;
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else {
            field += char;
        }
    }

    if (quoted) throw new Error('Unterminated quoted field');
    if (field !== '' || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
};

export const csvToJson = (text, { delimiter = ',', header = true } = {}) => {
    const rows = parseCsv(text, delimiter);
    if (rows.length === 0) return [];
    if (!header) return rows;

    const headers = rows[0].map((name) => name.trim());
    return rows.slice(1).map((row) =>
        Object.fromEntries(headers.map((name, index) => [name, (row[index] ?? '').trim()]))
    );
};

// Van Ophuijsen spelling (pre-1947) from modern Indonesian spelling, converted in a single pass.
const VAN_OPHUIJSEN = { ny: 'nj', sy: 'sj', kh: 'ch', j: 'dj', y: 'j', c: 'tj', u: 'oe' };

export const toVanOphuijsen = (text) =>
    text.replace(/ny|sy|kh|j|y|c|u/gi, (match) => {
        const converted = VAN_OPHUIJSEN[match.toLowerCase()];
        if (match.length > 1 && match === match.toUpperCase()) return converted.toUpperCase();
        return match[0] === match[0].toUpperCase() ? converted[0].toUpperCase() + converted.slice(1) : converted;
    });

// Base64 that is safe for non-ASCII text
export const base64Encode = (text, { urlSafe = false } = {}) => {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const encoded = btoa(binary);
    return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded;
};

export const base64Decode = (text) => {
    const normalized = text.trim().replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
};

// JSON
export const formatJson = (text, indent = 2) => JSON.stringify(JSON.parse(text), null, indent);
export const minifyJson = (text) => JSON.stringify(JSON.parse(text));

// CSV / JSON
const csvCell = (value, delimiter) => {
    const text = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    return text.includes('"') || text.includes('\n') || text.includes('\r') || text.includes(delimiter)
        ? `"${text.replace(/"/g, '""')}"`
        : text;
};

export const jsonToCsv = (text, { delimiter = ',' } = {}) => {
    const data = JSON.parse(text);
    const rows = Array.isArray(data) ? data : [data];
    if (rows.some((row) => row === null || typeof row !== 'object' || Array.isArray(row))) {
        throw new Error('Expected a JSON object or an array of objects.');
    }
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
    return [columns, ...rows.map((row) => columns.map((column) => row[column]))]
        .map((row) => row.map((cell) => csvCell(cell, delimiter)).join(delimiter))
        .join('\n');
};

const escapeCell = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const csvToHtmlTable = (text, { delimiter = ',', header = true } = {}) => {
    const rows = parseCsv(text, delimiter);
    if (rows.length === 0) return '';
    const line = (cells, tag) => `    <tr>\n${cells.map((cell) => `      <${tag}>${escapeCell(cell)}</${tag}>`).join('\n')}\n    </tr>`;
    const head = header ? `  <thead>\n${line(rows[0], 'th')}\n  </thead>\n` : '';
    const body = (header ? rows.slice(1) : rows).map((row) => line(row, 'td')).join('\n');
    return `<table>\n${head}  <tbody>\n${body}\n  </tbody>\n</table>`;
};

export const textToHtmlList = (text, { ordered = false } = {}) => {
    const tag = ordered ? 'ol' : 'ul';
    const items = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    return `<${tag}>\n${items.map((item) => `  <li>${escapeCell(item)}</li>`).join('\n')}\n</${tag}>`;
};

// Java .properties
const flatten = (value, prefix, out) => {
    if (Array.isArray(value)) {
        if (value.length === 0) out[prefix] = '';
        value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, out));
    } else if (value !== null && typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0 && prefix) out[prefix] = '';
        keys.forEach((key) => flatten(value[key], prefix ? `${prefix}.${key}` : key, out));
    } else {
        out[prefix] = value === null ? '' : String(value);
    }
    return out;
};

const escapeProperty = (text, isKey) =>
    text
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(isKey ? /[=: ]/g : /^ /, (char) => `\\${char}`);

export const jsonToProperties = (text) => {
    const data = JSON.parse(text);
    if (data === null || typeof data !== 'object') throw new Error('Expected a JSON object or array.');
    return Object.entries(flatten(data, '', {}))
        .map(([key, value]) => `${escapeProperty(key, true)}=${escapeProperty(value, false)}`)
        .join('\n');
};

const unescapeProperty = (text) =>
    text.replace(/\\(?:u([0-9a-f]{4})|([\s\S]))/gi, (_, unicode, char) => {
        if (unicode) return String.fromCharCode(parseInt(unicode, 16));
        return { n: '\n', r: '\r', t: '\t' }[char] ?? char;
    });

const setPath = (target, path, value) => {
    const tokens = path.match(/[^.[\]]+/g) ?? [path];
    let node = target;
    tokens.forEach((token, index) => {
        const last = index === tokens.length - 1;
        const key = Array.isArray(node) ? Number(token) : token;
        if (last) {
            node[key] = value;
        } else {
            if (typeof node[key] !== 'object' || node[key] === null) {
                node[key] = /^\d+$/.test(tokens[index + 1]) ? [] : {};
            }
            node = node[key];
        }
    });
};

export const propertiesToJson = (text, indent = 2) => {
    const result = {};
    const logical = text.replace(/\\\r?\n\s*/g, '').split(/\r?\n/);
    for (const raw of logical) {
        const line = raw.replace(/^\s+/, '');
        if (line === '' || line.startsWith('#') || line.startsWith('!')) continue;
        const match = line.match(/^((?:\\.|[^=:\s\\])*)\s*[=:\s]\s*([\s\S]*)$/) ?? [null, line, ''];
        setPath(result, unescapeProperty(match[1]), unescapeProperty(match[2]));
    }
    return JSON.stringify(result, null, indent);
};

// Binary
export const textToBinary = (text) =>
    [...new TextEncoder().encode(text)].map((byte) => byte.toString(2).padStart(8, '0')).join(' ');

export const binaryToText = (text) => {
    const bits = text.replace(/[^01]/g, '');
    if (bits.length === 0 || bits.length % 8 !== 0) throw new Error('Binary input must be made of complete 8-bit groups.');
    const bytes = Uint8Array.from(bits.match(/.{8}/g), (byte) => parseInt(byte, 2));
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
        throw new Error('The binary data is not valid UTF-8 text.');
    }
};

// Words
const STOPWORDS = new Set(
    `a about above after again against all am an and any are aren't as at be because been before being below between both but by can can't cannot could couldn't did didn't do does doesn't doing don't down during each few for from further had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me more most mustn't my myself no nor not of off on once only or other ought our ours ourselves out over own same shan't she she'd she'll she's should shouldn't so some such than that that's the their theirs them themselves then there there's these they they'd they'll they're they've this those through to too under until up very was wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours yourself yourselves`.split(
        /\s+/
    )
);

export const removeStopwords = (text) =>
    text
        .replace(/[\p{L}\p{N}']+/gu, (word) => (STOPWORDS.has(word.toLowerCase().replace(/’/g, "'")) ? '' : word))
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/ +([,.;:!?])/g, '$1')
        .replace(/^[ \t]+|[ \t]+$/gm, '')
        .trim();

export const uniqueWords = (text, { sort = false } = {}) => {
    const seen = new Map();
    for (const word of text.match(/[\p{L}\p{N}'’-]+/gu) ?? []) {
        const key = word.toLowerCase();
        if (!seen.has(key)) seen.set(key, key);
    }
    const words = [...seen.values()];
    return (sort ? words.sort((a, b) => a.localeCompare(b)) : words).join('\n');
};
