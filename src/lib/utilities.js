// More backlog tools: email normalizer, MAC address tools, RSA key pair generator, CSS minifier.
import { randomInt } from './random.js';

// ---------- Email normalizer ----------
const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

/** Normalizes one email address. Returns { email, valid, reason }. */
export const normalizeEmail = (input, { removeTags = true, gmailDots = true } = {}) => {
    const raw = String(input).trim().replace(/^mailto:/i, '').replace(/^<|>$/g, '');
    const at = raw.lastIndexOf('@');
    if (at < 1 || at === raw.length - 1) return { email: raw, valid: false, reason: 'An email address needs a name, an @ and a domain.' };
    let local = raw.slice(0, at).toLowerCase();
    let domain = raw.slice(at + 1).toLowerCase().replace(/\.$/, '');
    if (/\s/.test(raw) || raw.indexOf('@') !== at) return { email: raw, valid: false, reason: 'It contains spaces or more than one @.' };
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) && !/^xn--/.test(domain.split('.').pop())) return { email: raw, valid: false, reason: `The domain "${domain}" does not look right.` };
    if (domain === 'googlemail.com') domain = 'gmail.com';
    if (removeTags && local.includes('+')) local = local.slice(0, local.indexOf('+'));
    if (gmailDots && GMAIL_DOMAINS.has(domain)) local = local.replaceAll('.', '');
    if (!local) return { email: raw, valid: false, reason: 'Nothing is left of the name once the +tag is removed.' };
    return { email: `${local}@${domain}`, valid: true, reason: '' };
};

/** One email per line (or separated by commas and semicolons). Invalid lines are listed as comments. */
export const normalizeEmails = (text, { dedupe = true, ...options } = {}) => {
    const items = text.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
    const seen = new Set();
    const lines = [];
    for (const item of items) {
        const r = normalizeEmail(item, options);
        if (!r.valid) {
            lines.push(`# Invalid: ${item} (${r.reason})`);
            continue;
        }
        if (dedupe && seen.has(r.email)) continue;
        seen.add(r.email);
        lines.push(r.email);
    }
    return lines.join('\n');
};

// ---------- MAC address ----------
const hex = (n) => n.toString(16).padStart(2, '0');

/** Reads a MAC address in any common notation into 6 bytes. */
export const parseMac = (input) => {
    const clean = String(input).trim().replace(/[:\-.\s]/g, '');
    if (!/^[0-9a-fA-F]{12}$/.test(clean)) throw new Error(`"${String(input).trim()}" is not a MAC address: it needs 12 hexadecimal digits, for example 00:1A:2B:3C:4D:5E.`);
    return clean.match(/../g).map((h) => parseInt(h, 16));
};

export const MAC_FORMATS = ['colon', 'hyphen', 'dot', 'plain'];

/** Formats 6 bytes: colon (00:1a:2b), hyphen (00-1a-2b), dot (Cisco 001a.2b3c.4d5e) or plain (001a2b3c4d5e). */
export const formatMac = (bytes, { format = 'colon', uppercase = false } = {}) => {
    const h = bytes.map(hex).join('');
    const text = { colon: h.match(/../g).join(':'), hyphen: h.match(/../g).join('-'), dot: h.match(/..../g).join('.'), plain: h }[format];
    if (text === undefined) throw new Error(`Unknown format "${format}". Use one of: ${MAC_FORMATS.join(', ')}.`);
    return uppercase ? text.toUpperCase() : text;
};

/** Describes a MAC address: unicast or multicast, universal or locally administered. */
export const describeMac = (bytes) => ({
    cast: bytes[0] & 1 ? 'multicast' : 'unicast',
    administration: bytes[0] & 2 ? 'locally administered' : 'universally administered (assigned to a manufacturer)',
    oui: bytes.slice(0, 3).map(hex).join(':')
});

/** Generates random MAC addresses. Locally administered unicast addresses never clash with real hardware. */
export const generateMacs = (count = 5, { local = true, unicast = true, ...format } = {}) =>
    Array.from({ length: Math.max(1, Math.min(Number(count) || 1, 100)) }, () => {
        const bytes = Array.from({ length: 6 }, () => randomInt(256));
        bytes[0] = (bytes[0] & 0xfc) | (local ? 2 : 0) | (unicast ? 0 : 1);
        return formatMac(bytes, format);
    });

/** One MAC per line in, every notation and the type out. */
export const macReport = (text) =>
    text
        .split(/\r?\n/)
        .filter((l) => l.trim())
        .map((line) => {
            const bytes = parseMac(line);
            const d = describeMac(bytes);
            return [formatMac(bytes, { format: 'colon', uppercase: true }), formatMac(bytes, { format: 'hyphen', uppercase: true }), formatMac(bytes, { format: 'dot' }), `${d.cast}, ${d.administration}`].join('  |  ');
        })
        .join('\n');

// ---------- RSA key pair ----------
const toPem = (der, label) => {
    const bytes = new Uint8Array(der);
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return `-----BEGIN ${label}-----\n${btoa(binary).match(/.{1,64}/g).join('\n')}\n-----END ${label}-----\n`;
};

/** Generates an RSA key pair with Web Crypto. Returns PEM strings (PKCS#8 private key, SPKI public key). */
export const generateRsaKeyPair = async ({ bits = 2048, usage = 'sign' } = {}) => {
    if (![2048, 3072, 4096].includes(Number(bits))) throw new Error('Key size must be 2048, 3072 or 4096 bits.');
    const encrypt = usage === 'encrypt';
    const pair = await crypto.subtle.generateKey(
        { name: encrypt ? 'RSA-OAEP' : 'RSASSA-PKCS1-v1_5', modulusLength: Number(bits), publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        encrypt ? ['encrypt', 'decrypt'] : ['sign', 'verify']
    );
    return {
        privateKey: toPem(await crypto.subtle.exportKey('pkcs8', pair.privateKey), 'PRIVATE KEY'),
        publicKey: toPem(await crypto.subtle.exportKey('spki', pair.publicKey), 'PUBLIC KEY')
    };
};

// ---------- CSS minifier ----------
/** Minifies CSS: removes comments and extra whitespace, shortens leading zeros and hex colors, drops the last semicolon of each block. */
export const minifyCss = (css) => {
    // Pull strings and url(...) out first so nothing inside them is touched.
    const saved = [];
    const hold = (match) => `\u0000${saved.push(match) - 1}\u0000`;
    let text = css
        .replace(/\/\*[\s\S]*?\*\//g, (m) => (m.startsWith('/*!') ? hold(m) : ''))
        .replace(/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|url\(\s*[^)'"]*\s*\)/gi, (m) => hold(m.replace(/^url\(\s*([^)]*?)\s*\)$/i, 'url($1)')));
    if (/\/\*/.test(text)) throw new Error('A comment is not closed: add */ at its end.');
    text = text
        .replace(/\s+/g, ' ')
        .replace(/\s*([{};,>~])\s*/g, '$1')
        .replace(/\s+:(?=[^{};]*[;}])/g, ':')
        .replace(/:\s+/g, ':')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .replace(/;}/g, '}')
        .replace(/(^|[\s:,(])0*\.(\d)/g, '$1.$2')
        .replace(/(^|[\s:,(])(-?)0+(\.\d+)/g, '$1$2$3')
        .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(?![0-9a-f])/gi, '#$1$2$3')
        .trim();

    let depth = 0;
    for (const c of text) depth += c === '{' ? 1 : c === '}' ? -1 : 0;
    if (depth !== 0) throw new Error(depth > 0 ? 'A { is not closed: add a } at the end.' : 'There is a } without a matching {.');
    text = text.replace(/\u0000(\d+)\u0000/g, (_, i) => saved[Number(i)]);
    return text;
};
