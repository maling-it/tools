// Text escaping, case and statistics utilities

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

const escapeWith = (map) => (text) => text.replace(/[&<>"']/g, (char) => map[char]);

// Decodes in a single pass so `&amp;lt;` becomes `&lt;` and not `<`.
const decodeEntities = (text) =>
    text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (match, dec, hex, name) => {
        if (dec !== undefined || hex !== undefined) {
            const codePoint = dec !== undefined ? parseInt(dec, 10) : parseInt(hex, 16);
            return codePoint > 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
        }
        return NAMED_ENTITIES[name.toLowerCase()] ?? match;
    });

export const escapeHtml = escapeWith(HTML_ESCAPES);
export const unescapeHtml = decodeEntities;
export const escapeXml = escapeWith(XML_ESCAPES);
export const unescapeXml = decodeEntities;

const JS_ESCAPES = {
    '\\': '\\\\',
    "'": "\\'",
    '"': '\\"',
    '<': '\\x3C',
    '>': '\\x3E',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\b': '\\b',
    '\f': '\\f',
    '\v': '\\v',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};
const JS_UNESCAPES = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', 0: '\0' };

export const escapeJs = (text) =>
    text.replace(/[\\'"<>\u0000-\u001f\u2028\u2029]/g, (char) => {
        return JS_ESCAPES[char] ?? `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`;
    });

export const unescapeJs = (text) =>
    text.replace(
        /\\(?:u\{([0-9a-f]+)\}|u([0-9a-f]{4})|x([0-9a-f]{2})|([\s\S]))/gi,
        (match, braced, unicode, hex, char) => {
            if (braced !== undefined) {
                const codePoint = parseInt(braced, 16);
                return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
            }
            if (unicode !== undefined || hex !== undefined) {
                return String.fromCharCode(parseInt(unicode ?? hex, 16));
            }
            return JS_UNESCAPES[char] ?? char;
        }
    );

// Throws a URIError on malformed input, callers decide how to report it.
export const urlEncode = (text) => encodeURIComponent(text);
export const urlDecode = (text) => {
    try {
        return decodeURIComponent(text.replace(/\+/g, ' '));
    } catch {
        throw new Error('The input has malformed percent-encoding, for example a stray % sign.');
    }
};

// Case conversion
const splitWords = (text) =>
    text.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2').match(/[\p{L}\p{N}]+/gu) ?? [];

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

export const caseConverters = {
    upper: (text) => text.toUpperCase(),
    lower: (text) => text.toLowerCase(),
    title: (text) => text.toLowerCase().replace(/(^|[^\p{L}\p{N}'])(\p{L})/gu, (_, sep, char) => sep + char.toUpperCase()),
    sentence: (text) => text.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, sep, char) => sep + char.toUpperCase()),
    camel: (text) => splitWords(text).map((word, i) => (i === 0 ? word.toLowerCase() : capitalize(word.toLowerCase()))).join(''),
    pascal: (text) => splitWords(text).map((word) => capitalize(word.toLowerCase())).join(''),
    snake: (text) => splitWords(text).map((word) => word.toLowerCase()).join('_'),
    kebab: (text) => splitWords(text).map((word) => word.toLowerCase()).join('-'),
    constant: (text) => splitWords(text).map((word) => word.toUpperCase()).join('_')
};

// Find and replace
export const replaceText = (text, find, replacement, { regex = false, caseSensitive = true } = {}) => {
    if (find === '') return { text, count: 0 };
    const source = regex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(source, caseSensitive ? 'g' : 'gi');
    const count = [...text.matchAll(pattern)].length;
    // Plain mode must not interpret `$&` and friends in the replacement.
    const result = regex ? text.replace(pattern, replacement) : text.replace(pattern, () => replacement);
    return { text: result, count };
};

// Statistics
export const textStats = (text) => {
    const words = text.match(/[\p{L}\p{N}_'’-]+/gu) ?? [];
    const trimmed = text.trim();

    return {
        totalWords: words.length,
        uniqueWords: new Set(words.map((word) => word.toLowerCase())).size,
        totalLines: text === '' ? 0 : text.split(/\r?\n/).length,
        totalSentences: (trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).length,
        totalParagraphs: trimmed === '' ? 0 : trimmed.split(/\n\s*\n/).length,
        totalCharacters: text.length,
        totalCharactersNoSpaces: text.replace(/\s/g, '').length,
        readingMinutes: Math.ceil(words.length / 200)
    };
};

// Clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
};
