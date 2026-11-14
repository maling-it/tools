// Helpers for tools that work on many items at once
import SparkMD5 from 'spark-md5';
import { base64Decode, base64Encode, parseCsv, rowsToCsv } from './converters.js';
import { md5, shaHash } from './generators.js';
import { slugify } from './devUtils.js';
import { caseConverters, escapeHtml, escapeJs, replaceText, unescapeHtml, unescapeJs, urlDecode, urlEncode } from './textUtils.js';
import { estimateTokens } from './vibe.js';

// Per-line operations
const TRACKING = /^(utm_[a-z]+|fbclid|gclid|mc_eid|mc_cid|igshid|ref|ref_src|_hsenc|_hsmi)$/i;

const hostOf = (line) => {
    const text = line.trim();
    try {
        return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`).hostname;
    } catch {
        throw new Error('Not a valid URL.');
    }
};

export const LINE_OPERATIONS = [
    { id: 'urlEncode', group: 'Encode', label: 'URL encode', run: urlEncode },
    { id: 'urlDecode', group: 'Encode', label: 'URL decode', run: (l) => urlDecode(l) },
    { id: 'base64Encode', group: 'Encode', label: 'Base64 encode', run: (l) => base64Encode(l) },
    { id: 'base64Decode', group: 'Encode', label: 'Base64 decode', run: base64Decode },
    { id: 'htmlEscape', group: 'Encode', label: 'HTML escape', run: escapeHtml },
    { id: 'htmlUnescape', group: 'Encode', label: 'HTML unescape', run: unescapeHtml },
    { id: 'jsEscape', group: 'Encode', label: 'JavaScript escape', run: escapeJs },
    { id: 'jsUnescape', group: 'Encode', label: 'JavaScript unescape', run: unescapeJs },
    { id: 'upper', group: 'Case', label: 'UPPERCASE', run: caseConverters.upper },
    { id: 'lower', group: 'Case', label: 'lowercase', run: caseConverters.lower },
    { id: 'title', group: 'Case', label: 'Title Case', run: caseConverters.title },
    { id: 'camel', group: 'Case', label: 'camelCase', run: caseConverters.camel },
    { id: 'snake', group: 'Case', label: 'snake_case', run: caseConverters.snake },
    { id: 'kebab', group: 'Case', label: 'kebab-case', run: caseConverters.kebab },
    { id: 'slugify', group: 'Text', label: 'Slugify', run: (l) => slugify(l) },
    { id: 'trim', group: 'Text', label: 'Trim whitespace', run: (l) => l.trim() },
    { id: 'collapse', group: 'Text', label: 'Collapse repeated spaces', run: (l) => l.replace(/\s+/g, ' ').trim() },
    { id: 'reverse', group: 'Text', label: 'Reverse text', run: (l) => [...l].reverse().join('') },
    { id: 'length', group: 'Text', label: 'Count characters', run: (l) => String([...l].length) },
    { id: 'words', group: 'Text', label: 'Count words', run: (l) => String((l.match(/\S+/g) ?? []).length) },
    { id: 'affix', group: 'Text', label: 'Add prefix and suffix', run: (l, o) => `${o.prefix ?? ''}${l}${o.suffix ?? ''}` },
    { id: 'replace', group: 'Text', label: 'Find and replace', run: (l, o) => replaceText(l, o.find ?? '', o.replacement ?? '', { regex: o.regex, caseSensitive: o.caseSensitive ?? true }).text },
    { id: 'domain', group: 'URL', label: 'Get domain from URL', run: hostOf },
    {
        id: 'stripTracking',
        group: 'URL',
        label: 'Remove tracking parameters',
        run: (l) => {
            let url;
            try {
                url = new URL(l.trim());
            } catch {
                throw new Error('Not a valid URL.');
            }
            for (const key of [...url.searchParams.keys()]) if (TRACKING.test(key)) url.searchParams.delete(key);
            return url.toString();
        }
    },
    { id: 'md5', group: 'Hash', label: 'MD5', run: md5 },
    { id: 'sha1', group: 'Hash', label: 'SHA-1', run: (l) => shaHash(l, 'SHA-1') },
    { id: 'sha256', group: 'Hash', label: 'SHA-256', run: (l) => shaHash(l, 'SHA-256') },
    { id: 'sha512', group: 'Hash', label: 'SHA-512', run: (l) => shaHash(l, 'SHA-512') }
];

// Applies one operation to every line. Errors are reported per line instead of failing the whole batch.
export const runBulk = async (text, operationId, options = {}) => {
    const operation = LINE_OPERATIONS.find((op) => op.id === operationId);
    if (!operation) throw new Error(`Unknown operation "${operationId}".`);
    const lines = text.split(/\r?\n/);
    if (lines.at(-1) === '') lines.pop();
    const rows = [];
    for (const input of lines) {
        if (input === '' && options.skipEmpty !== false) {
            rows.push({ input, output: '', error: '' });
            continue;
        }
        try {
            rows.push({ input, output: String(await operation.run(input, options)), error: '' });
        } catch (error) {
            rows.push({ input, output: '', error: error.message });
        }
    }
    return rows;
};

// Hash of raw bytes (files)
const hex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

export const hashBuffer = async (buffer) => ({
    md5: SparkMD5.ArrayBuffer.hash(buffer),
    sha1: hex(await crypto.subtle.digest('SHA-1', buffer)),
    sha256: hex(await crypto.subtle.digest('SHA-256', buffer)),
    sha512: hex(await crypto.subtle.digest('SHA-512', buffer))
});

// Bulk renaming
const CASE_MODES = { none: null, lower: caseConverters.lower, upper: caseConverters.upper, snake: caseConverters.snake, kebab: caseConverters.kebab, camel: caseConverters.camel, title: caseConverters.title };

export const RENAME_CASES = Object.keys(CASE_MODES);

export const planRename = (names, o = {}) => {
    const clean = (text) => text.replace(/[\\/:*?"<>|]+/g, '_');
    const plan = names.map((name, index) => {
        const dot = name.lastIndexOf('.');
        const hasExt = dot > 0;
        let stem = hasExt ? name.slice(0, dot) : name;
        let ext = hasExt ? name.slice(dot + 1) : '';

        if (o.find) stem = replaceText(stem, o.find, o.replace ?? '', { regex: o.regex, caseSensitive: o.caseSensitive ?? true }).text;
        const convert = CASE_MODES[o.caseMode ?? 'none'];
        if (convert) stem = convert(stem);
        stem = `${o.prefix ?? ''}${stem}${o.suffix ?? ''}`;

        if (o.numbering) {
            const number = String((o.start ?? 1) + index).padStart(o.pad ?? 1, '0');
            stem = o.numbering === 'replace' ? number : o.numbering === 'prefix' ? `${number}_${stem}` : `${stem}_${number}`;
        }
        if (o.extension === 'lower') ext = ext.toLowerCase();
        else if (o.extension === 'remove') ext = '';
        else if (o.extension === 'set' && o.newExtension) ext = o.newExtension.replace(/^\./, '');

        return { from: name, to: clean(ext ? `${stem}.${ext}` : stem) };
    });

    const counts = new Map();
    for (const item of plan) counts.set(item.to.toLowerCase(), (counts.get(item.to.toLowerCase()) ?? 0) + 1);
    return plan.map((item) => ({ ...item, changed: item.from !== item.to, conflict: counts.get(item.to.toLowerCase()) > 1 || item.to === '' }));
};

const shell = (text) => `'${text.replace(/'/g, `'\\''`)}'`;

export const renameScript = (plan) =>
    ['#!/bin/sh', ...plan.filter((item) => item.changed && !item.conflict).map((item) => `mv -n -- ${shell(item.from)} ${shell(item.to)}`)].join('\n') + '\n';

// Data extraction
export const EXTRACTORS = {
    emails: { label: 'Email addresses', pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g },
    urls: { label: 'URLs', pattern: /https?:\/\/[^\s<>"'`]+/g, clean: (v) => v.replace(/[.,;:!?)\]}]+$/, '') },
    domains: { label: 'Domains', custom: true },
    ipv4: { label: 'IPv4 addresses', pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g },
    uuids: { label: 'UUIDs', pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi },
    hashtags: { label: 'Hashtags', pattern: /(?<![\w&])#[\p{L}\p{N}_]+/gu },
    mentions: { label: '@mentions', pattern: /(?<![\w.@])@[A-Za-z0-9_]{1,30}\b/g },
    colors: { label: 'HEX colors', pattern: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g },
    numbers: { label: 'Numbers', pattern: /-?\d+(?:[.,]\d+)*/g },
    phones: { label: 'Phone numbers', pattern: /\+?\d[\d\s().-]{7,}\d/g }
};

export const extractData = (text, kind, { unique = true, sort = false } = {}) => {
    const spec = EXTRACTORS[kind];
    if (!spec) throw new Error(`Unknown data type "${kind}".`);
    let items;
    if (kind === 'domains') {
        const hosts = [];
        for (const url of text.match(EXTRACTORS.urls.pattern) ?? []) {
            try {
                hosts.push(new URL(EXTRACTORS.urls.clean(url)).hostname);
            } catch {
                // Skip text that only looks like a URL.
            }
        }
        for (const email of text.match(EXTRACTORS.emails.pattern) ?? []) hosts.push(email.split('@')[1]);
        items = hosts.map((h) => h.toLowerCase());
    } else {
        items = (text.match(spec.pattern) ?? []).map((value) => (spec.clean ? spec.clean(value) : value.trim()));
    }
    if (unique) items = [...new Set(items)];
    if (sort) items = [...items].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return items;
};

// Splitting long text into chunks that fit a token budget
const tokensOf = (text) => estimateTokens(text).tokens;

const splitLong = (unit, maxTokens) => {
    if (tokensOf(unit) <= maxTokens) return [unit];
    const sentences = unit.split(/(?<=[.!?])\s+/);
    const pieces = [];
    for (const sentence of sentences) {
        if (tokensOf(sentence) <= maxTokens) {
            pieces.push(sentence);
        } else {
            const size = Math.max(maxTokens * 3, 1);
            for (let i = 0; i < sentence.length; i += size) pieces.push(sentence.slice(i, i + size));
        }
    }
    return pieces;
};

export const chunkText = (text, { maxTokens = 1000, overlapTokens = 0 } = {}) => {
    if (!text.trim()) return [];
    if (maxTokens < 10) throw new Error('Choose at least 10 tokens per chunk.');
    if (overlapTokens < 0 || overlapTokens >= maxTokens) throw new Error('The overlap must be smaller than the chunk size.');

    const units = text
        .trim()
        .split(/\n{2,}/)
        .flatMap((paragraph) => splitLong(paragraph, maxTokens));

    const chunks = [];
    let current = '';
    for (const unit of units) {
        const candidate = current ? `${current}\n\n${unit}` : unit;
        if (current && tokensOf(candidate) > maxTokens) {
            chunks.push(current);
            // Start the next chunk with the tail of this one, cut at a word boundary.
            const tail = overlapTokens > 0 ? current.slice(-overlapTokens * 4).replace(/^\S*\s/, '') : '';
            current = tail && tokensOf(`${tail}\n\n${unit}`) <= maxTokens ? `${tail}\n\n${unit}` : unit;
        } else {
            current = candidate;
        }
    }
    if (current) chunks.push(current);
    return chunks.map((content, index) => ({ index: index + 1, content, tokens: tokensOf(content) }));
};

// CSV splitting
export const splitCsv = (text, { rowsPerFile = 1000, header = true, delimiter = ',' } = {}) => {
    const n = Math.floor(rowsPerFile);
    if (!(n >= 1)) throw new Error('Rows per file must be at least 1.');
    const rows = parseCsv(text, delimiter);
    if (rows.length === 0) return [];
    const head = header ? [rows[0]] : [];
    const body = header ? rows.slice(1) : rows;
    const parts = [];
    for (let i = 0; i < body.length; i += n) parts.push(rowsToCsv([...head, ...body.slice(i, i + n)], delimiter));
    return parts.length ? parts : [rowsToCsv(head, delimiter)];
};
