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
