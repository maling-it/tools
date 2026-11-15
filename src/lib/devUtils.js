// Developer utilities: ids, text helpers, number systems, time, colors and units
import { randomInt, pick, shuffle } from './random.js';

// Identifiers
export const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export const uuidV4 = () => crypto.randomUUID();

export const uuidV7 = (time = Date.now()) => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    let ms = BigInt(time);
    for (let i = 5; i >= 0; i--) {
        bytes[i] = Number(ms & 0xffn);
        ms >>= 8n;
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const ulid = (time = Date.now()) => {
    let timestamp = '';
    let t = time;
    for (let i = 0; i < 10; i++) {
        timestamp = CROCKFORD[t % 32] + timestamp;
        t = Math.floor(t / 32);
    }
    return timestamp + Array.from({ length: 16 }, () => CROCKFORD[randomInt(32)]).join('');
};

// Text helpers
export const slugify = (text, { separator = '-' } = {}) =>
    text
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, separator)
        .replace(new RegExp(`^${separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+|${separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+$`, 'g'), '');

const LOREM = `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum`.split(' ');

const sentence = () => {
    const words = Array.from({ length: 6 + randomInt(10) }, () => pick(LOREM));
    return words[0][0].toUpperCase() + words[0].slice(1) + ' ' + words.slice(1).join(' ') + '.';
};

export const loremIpsum = ({ unit = 'paragraphs', count = 3, startWithLorem = true } = {}) => {
    const n = Math.max(1, Math.min(Number(count) || 1, 200));
    let result;
    if (unit === 'words') {
        result = Array.from({ length: n }, () => pick(LOREM));
        if (startWithLorem) result.splice(0, Math.min(5, n), ...'lorem ipsum dolor sit amet'.split(' ').slice(0, Math.min(5, n)));
        result = result.join(' ');
    } else if (unit === 'sentences') {
        result = Array.from({ length: n }, sentence);
        if (startWithLorem) result[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        result = result.join(' ');
    } else {
        const paragraphs = Array.from({ length: n }, () => Array.from({ length: 3 + randomInt(4) }, sentence).join(' '));
        if (startWithLorem) paragraphs[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + paragraphs[0];
        result = paragraphs.join('\n\n');
    }
    return result;
};

const NATO = { a: 'Alpha', b: 'Bravo', c: 'Charlie', d: 'Delta', e: 'Echo', f: 'Foxtrot', g: 'Golf', h: 'Hotel', i: 'India', j: 'Juliett', k: 'Kilo', l: 'Lima', m: 'Mike', n: 'November', o: 'Oscar', p: 'Papa', q: 'Quebec', r: 'Romeo', s: 'Sierra', t: 'Tango', u: 'Uniform', v: 'Victor', w: 'Whiskey', x: 'X-ray', y: 'Yankee', z: 'Zulu', 0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Niner' };

export const textToNato = (text) =>
    [...text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')]
        .map((char) => NATO[char.toLowerCase()] ?? (char === ' ' ? '/' : char))
        .join(' ');

export const textToUnicode = (text) => [...text].map((char) => `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ');

export const unicodeToText = (text) => {
    // A list of plain `U+XXXX` tokens is joined without the separating spaces.
    const onlyCodePoints = /^\s*(?:U\+[0-9a-f]{1,6}\s*)+$/i.test(text);
    const source = onlyCodePoints ? text.trim().split(/\s+/).join('') : text;
    return source.replace(/U\+([0-9a-f]{1,6})|\\u\{([0-9a-f]+)\}|\\u([0-9a-f]{4})|&#x([0-9a-f]+);|&#(\d+);/gi, (match, a, b, c, d, e) => {
        const codePoint = e !== undefined ? parseInt(e, 10) : parseInt(a ?? b ?? c ?? d, 16);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
    });
};

export const numeronym = (word) => {
    const w = word.trim();
    return w.length <= 3 ? w : `${w[0]}${w.length - 2}${w.at(-1)}`;
};

// Line tools
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export const lineTools = {
    sort: (lines) => [...lines].sort((a, b) => collator.compare(a, b)),
    sortDescending: (lines) => [...lines].sort((a, b) => collator.compare(b, a)),
    reverse: (lines) => [...lines].reverse(),
    unique: (lines) => [...new Set(lines)],
    shuffle: (lines) => shuffle(lines),
    trim: (lines) => lines.map((line) => line.trim()),
    removeEmpty: (lines) => lines.filter((line) => line.trim() !== ''),
    number: (lines) => lines.map((line, index) => `${index + 1}. ${line}`)
};

export const applyLineTool = (text, tool) => lineTools[tool](text.split(/\r?\n/)).join('\n');

// Number systems
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

export const convertBase = (value, from, to) => {
    if (from < 2 || from > 36 || to < 2 || to > 36) throw new Error('Bases must be between 2 and 36.');
    let text = value.trim().toLowerCase().replace(/[_\s]/g, '');
    const negative = text.startsWith('-');
    if (negative) text = text.slice(1);
    if (from === 16) text = text.replace(/^0x/, '');
    if (from === 2) text = text.replace(/^0b/, '');
    if (from === 8) text = text.replace(/^0o/, '');
    if (text === '') throw new Error('Enter a number.');

    let number = 0n;
    for (const char of text) {
        const digit = DIGITS.indexOf(char);
        if (digit < 0 || digit >= from) throw new Error(`"${char}" is not a valid base ${from} digit.`);
        number = number * BigInt(from) + BigInt(digit);
    }
    const result = number.toString(to);
    return negative && number !== 0n ? `-${result}` : result;
};

const ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];

export const toRoman = (number) => {
    const n = Number(number);
    if (!Number.isInteger(n) || n < 1 || n > 3999) throw new Error('Enter a whole number from 1 to 3999.');
    let rest = n;
    let result = '';
    for (const [value, symbol] of ROMAN) {
        while (rest >= value) {
            result += symbol;
            rest -= value;
        }
    }
    return result;
};

export const fromRoman = (text) => {
    const roman = text.trim().toUpperCase();
    if (!/^[MDCLXVI]+$/.test(roman)) throw new Error(`"${text.trim()}" is not a Roman numeral. Use the letters I, V, X, L, C, D and M, for example XIV.`);
    const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < roman.length; i++) {
        const value = values[roman[i]];
        total += value < (values[roman[i + 1]] ?? 0) ? -value : value;
    }
    if (toRoman(total) !== roman) throw new Error(`"${roman}" is not written the standard way. Roman numerals do not repeat a letter more than three times in a row (write IV, not IIII).`);
    return total;
};

// Time
export const parseDateInput = (text) => {
    const input = text.trim();
    if (input === '') throw new Error('Enter a timestamp or date.');
    if (/^-?\d+(\.\d+)?$/.test(input)) {
        const n = Number(input);
        // 13+ digits are treated as milliseconds, shorter values as seconds.
        return new Date(Math.abs(n) >= 1e12 ? n : n * 1000);
    }
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) throw new Error(`Could not understand "${input}" as a date. Use a Unix timestamp (seconds or milliseconds) or a date such as 2026-11-15T10:30:00Z.`);
    return date;
};

export const describeDate = (date, now = Date.now()) => {
    if (Number.isNaN(date.getTime())) throw new Error('Invalid date.');
    const seconds = Math.round((date.getTime() - now) / 1000);
    const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
    const [unit, size] = units.find(([, s]) => Math.abs(seconds) >= s) ?? ['second', 1];
    return {
        unixSeconds: Math.floor(date.getTime() / 1000),
        unixMilliseconds: date.getTime(),
        iso8601: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toString(),
        relative: new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round(seconds / size), unit)
    };
};

// chmod
const FLAGS = ['r', 'w', 'x'];

export const octalToPermissions = (octal) => {
    if (!/^[0-7]{3}$/.test(octal)) throw new Error('Use three octal digits, e.g. 755.');
    return [...octal].map((digit) => {
        const n = Number(digit);
        return { r: !!(n & 4), w: !!(n & 2), x: !!(n & 1) };
    });
};

export const permissionsToOctal = (permissions) =>
    permissions.map((p) => (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0)).join('');

export const permissionsToSymbolic = (permissions) => permissions.map((p) => FLAGS.map((f) => (p[f] ? f : '-')).join('')).join('');

// Colors
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const parseColor = (input) => {
    const text = input.trim().toLowerCase();
    let match = /^#?([0-9a-f]{3,8})$/.exec(text);
    if (match && [3, 4, 6, 8].includes(match[1].length)) {
        let hex = match[1];
        if (hex.length <= 4) hex = [...hex].map((c) => c + c).join('');
        const n = (i) => parseInt(hex.slice(i, i + 2), 16);
        return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? Number((n(6) / 255).toFixed(3)) : 1 };
    }
    match = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/.exec(text);
    if (match) {
        const alpha = match[4] === undefined ? 1 : match[4].endsWith('%') ? parseFloat(match[4]) / 100 : Number(match[4]);
        return { r: clamp(Math.round(match[1]), 0, 255), g: clamp(Math.round(match[2]), 0, 255), b: clamp(Math.round(match[3]), 0, 255), a: clamp(alpha, 0, 1) };
    }
    match = /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:[\s,/]+([\d.]+%?))?\s*\)$/.exec(text);
    if (match) {
        const alpha = match[4] === undefined ? 1 : match[4].endsWith('%') ? parseFloat(match[4]) / 100 : Number(match[4]);
        return { ...hslToRgb(Number(match[1]), Number(match[2]), Number(match[3])), a: clamp(alpha, 0, 1) };
    }
    throw new Error('Use a HEX, rgb() or hsl() color, e.g. #1e90ff.');
};

export const hslToRgb = (h, s, l) => {
    const sat = clamp(s, 0, 100) / 100;
    const light = clamp(l, 0, 100) / 100;
    const k = (n) => (n + (((h % 360) + 360) % 360) / 30) % 12;
    const a = sat * Math.min(light, 1 - light);
    const f = (n) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
};

export const rgbToHsl = ({ r, g, b }) => {
    const [rn, gn, bn] = [r, g, b].map((v) => v / 255);
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    const d = max - min;
    let h = 0;
    let s = 0;
    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1));
        if (max === rn) h = ((gn - bn) / d) % 6;
        else if (max === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h = (h * 60 + 360) % 360;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const rgbToCmyk = ({ r, g, b }) => {
    const [rn, gn, bn] = [r, g, b].map((v) => v / 255);
    const k = 1 - Math.max(rn, gn, bn);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const part = (v) => Math.round(((1 - v - k) / (1 - k)) * 100);
    return { c: part(rn), m: part(gn), y: part(bn), k: Math.round(k * 100) };
};

export const describeColor = (input) => {
    const rgb = parseColor(input);
    const hsl = rgbToHsl(rgb);
    const cmyk = rgbToCmyk(rgb);
    const hex = '#' + [rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, '0')).join('') + (rgb.a < 1 ? Math.round(rgb.a * 255).toString(16).padStart(2, '0') : '');
    const alpha = rgb.a < 1 ? `, ${rgb.a}` : '';
    return {
        hex,
        rgb: `${rgb.a < 1 ? 'rgba' : 'rgb'}(${rgb.r}, ${rgb.g}, ${rgb.b}${alpha})`,
        hsl: `${rgb.a < 1 ? 'hsla' : 'hsl'}(${hsl.h}, ${hsl.s}%, ${hsl.l}%${alpha})`,
        cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
    };
};

// WCAG contrast ratio between two colors
export const contrastRatio = (a, b) => {
    const luminance = ({ r, g, b: blue }) => {
        const [R, G, B] = [r, g, blue].map((v) => {
            const c = v / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };
    const [l1, l2] = [luminance(parseColor(a)), luminance(parseColor(b))].sort((x, y) => y - x);
    return Number((((l1 + 0.05) / (l2 + 0.05))).toFixed(2));
};

// Units
export const UNITS = {
    length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254, nmi: 1852 },
    mass: { kg: 1, g: 0.001, mg: 0.000001, t: 1000, lb: 0.45359237, oz: 0.028349523125, st: 6.35029318 },
    volume: { l: 1, ml: 0.001, 'm³': 1000, gal: 3.785411784, qt: 0.946352946, pt: 0.473176473, cup: 0.2365882365, 'fl oz': 0.0295735295625, tbsp: 0.01478676478125, tsp: 0.00492892159375 },
    speed: { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, kn: 0.514444, 'ft/s': 0.3048 },
    area: { 'm²': 1, 'km²': 1e6, 'cm²': 1e-4, ha: 1e4, acre: 4046.8564224, 'ft²': 0.09290304, 'in²': 0.00064516, 'mi²': 2589988.110336 },
    data: { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3, TiB: 1024 ** 4, bit: 0.125 },
    time: { s: 1, ms: 0.001, min: 60, h: 3600, d: 86400, wk: 604800, yr: 31557600 },
    temperature: { '°C': 0, '°F': 0, K: 0 }
};

export const convertUnit = (category, value, from, to) => {
    const table = UNITS[category];
    if (!table) throw new Error(`Unknown category "${category}". Use one of: ${Object.keys(UNITS).join(', ')}.`);
    for (const unit of [from, to]) {
        if (!(unit in table)) throw new Error(`"${unit}" is not a ${category} unit. Use one of: ${Object.keys(table).join(', ')}.`);
    }
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error('Enter a number.');
    if (category === 'temperature') {
        const celsius = from === '°C' ? n : from === '°F' ? ((n - 32) * 5) / 9 : n - 273.15;
        return to === '°C' ? celsius : to === '°F' ? (celsius * 9) / 5 + 32 : celsius + 273.15;
    }
    return (n * table[from]) / table[to];
};

export const percentages = ({ x, y }) => {
    const a = Number(x);
    const b = Number(y);
    if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('Enter two numbers.');
    return {
        percentOf: (a / 100) * b,
        isWhatPercent: b === 0 ? null : (a / b) * 100,
        change: a === 0 ? null : ((b - a) / Math.abs(a)) * 100
    };
};

export const svgPlaceholder = ({ width = 600, height = 400, background = '#cccccc', color = '#666666', text = '', fontSize = 0 } = {}) => {
    const w = clamp(Math.round(width), 1, 4000);
    const h = clamp(Math.round(height), 1, 4000);
    const label = (text || `${w}×${h}`).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const size = fontSize || Math.max(10, Math.round(Math.min(w, h) / 6));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n  <rect width="100%" height="100%" fill="${background}"/>\n  <text x="50%" y="50%" fill="${color}" font-family="sans-serif" font-size="${size}" text-anchor="middle" dominant-baseline="central">${label}</text>\n</svg>`;
};
