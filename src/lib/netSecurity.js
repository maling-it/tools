// Network and security helpers
import { base64Decode, base64Encode } from './converters.js';

// JWT (decoding only, the signature is never verified)
export const decodeJwt = (token) => {
    const parts = token.trim().replace(/^Bearer\s+/i, '').split('.');
    if (parts.length < 2 || parts.length > 3) throw new Error('A JWT has two or three dot-separated parts.');
    const parse = (part, name) => {
        try {
            return JSON.parse(base64Decode(part));
        } catch {
            throw new Error(`The ${name} is not valid Base64URL encoded JSON.`);
        }
    };
    const header = parse(parts[0], 'header');
    const payload = parse(parts[1], 'payload');
    const at = (seconds) => (typeof seconds === 'number' ? new Date(seconds * 1000).toISOString() : null);
    return {
        header,
        payload,
        signature: parts[2] ?? '',
        issuedAt: at(payload.iat),
        notBefore: at(payload.nbf),
        expiresAt: at(payload.exp),
        expired: typeof payload.exp === 'number' ? payload.exp * 1000 < Date.now() : null
    };
};

export const basicAuthHeader = (user, password) => `Authorization: Basic ${base64Encode(`${user}:${password}`)}`;

// HMAC
const HASHES = { 'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-384': 'SHA-384', 'SHA-512': 'SHA-512' };

export const hmac = async (message, key, algorithm = 'SHA-256', encoding = 'hex') => {
    if (!HASHES[algorithm]) throw new Error('Unsupported algorithm.');
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: algorithm }, false, ['sign']);
    const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message)));
    if (encoding === 'base64') {
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        return btoa(binary);
    }
    return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

// TOTP (RFC 6238)
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export const base32Decode = (text) => {
    const clean = text.toUpperCase().replace(/[\s=-]/g, '');
    if (clean === '') throw new Error('Enter a Base32 secret.');
    let bits = '';
    for (const char of clean) {
        const value = BASE32.indexOf(char);
        if (value < 0) throw new Error(`"${char}" is not a valid Base32 character.`);
        bits += value.toString(2).padStart(5, '0');
    }
    return Uint8Array.from(bits.match(/.{8}/g) ?? [], (byte) => parseInt(byte, 2));
};

export const totp = async ({ secret, digits = 6, period = 30, algorithm = 'SHA-1', time = Date.now() }) => {
    const key = await crypto.subtle.importKey('raw', base32Decode(secret), { name: 'HMAC', hash: algorithm }, false, ['sign']);
    const counter = BigInt(Math.floor(time / 1000 / period));
    const message = new Uint8Array(8);
    new DataView(message.buffer).setBigUint64(0, counter);
    const hash = new Uint8Array(await crypto.subtle.sign('HMAC', key, message));
    const offset = hash[hash.length - 1] & 0x0f;
    const binary = ((hash[offset] & 0x7f) << 24) | (hash[offset + 1] << 16) | (hash[offset + 2] << 8) | hash[offset + 3];
    return String(binary % 10 ** digits).padStart(digits, '0');
};

export const randomBase32Secret = (length = 32) => {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return [...bytes].map((b) => BASE32[b % 32]).join('');
};

// Password strength
const COMMON = new Set(`123456 password 12345678 qwerty 123456789 12345 1234 111111 1234567 dragon 123123 baseball abc123 football monkey letmein shadow master 666666 qwertyuiop 123321 mustang 1234567890 michael 654321 superman 1qaz2wsx 7777777 121212 000000 qazwsx 123qwe killer trustno1 jordan jennifer zxcvbnm asdfgh hunter buster soccer harley batman andrew tigger sunshine iloveyou 2000 charlie robert thomas hockey ranger daniel starwars klaster 112233 george computer michelle jessica pepper 1111 zxcvbn 555555 11111111 131313 freedom 777777 pass maggie 159753 aaaaaa ginger princess joshua cheese amanda summer love ashley nicole chelsea biteme matthew access yankees 987654321 dallas austin thunder taylor matrix welcome admin password1 passw0rd p@ssw0rd`.split(' '));

const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz', 'qwertyuiopasdfghjklzxcvbnm', '0123456789'];

export const passwordStrength = (password) => {
    if (password === '') throw new Error('Enter a password.');
    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/\d/.test(password)) pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 33;

    let bits = password.length * Math.log2(pool || 1);
    const warnings = [];
    const lower = password.toLowerCase();

    if (COMMON.has(lower)) {
        bits = Math.min(bits, 10);
        warnings.push('This is one of the most commonly used passwords.');
    }
    if (/(.)\1{2,}/.test(password)) {
        bits *= 0.8;
        warnings.push('Repeated characters make it easier to guess.');
    }
    if (SEQUENCES.some((seq) => [...seq].some((_, i) => i + 4 <= seq.length && lower.includes(seq.slice(i, i + 4))))) {
        bits *= 0.8;
        warnings.push('Keyboard or alphabet sequences make it easier to guess.');
    }
    if (password.length < 12) warnings.push('Use at least 12 characters.');
    if (pool < 62) warnings.push('Mix lowercase, uppercase, numbers and symbols.');

    bits = Math.round(bits);
    // Assume an offline attacker making ten billion guesses per second, finding it on average halfway.
    const seconds = 2 ** Math.max(bits - 1, 0) / 1e10;
    const label = bits < 28 ? 'Very weak' : bits < 36 ? 'Weak' : bits < 60 ? 'Fair' : bits < 80 ? 'Strong' : 'Very strong';
    return { bits, label, crackTime: formatDuration(seconds), warnings };
};

export const formatDuration = (seconds) => {
    if (seconds < 1) return 'instantly';
    const units = [['year', 31557600], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
    const [name, size] = units.find(([, s]) => seconds >= s);
    const value = seconds / size;
    if (name === 'year' && value >= 1e9) return 'billions of years or more';
    if (name === 'year' && value >= 1e6) return `${(value / 1e6).toFixed(1)} million years`;
    if (name === 'year' && value >= 1000) return `${Math.round(value).toLocaleString('en-US')} years`;
    const rounded = Math.round(value);
    return `${rounded} ${name}${rounded === 1 ? '' : 's'}`;
};

// Bcrypt (bcryptjs is loaded on demand because of its size)
export const bcryptHash = async (password, rounds = 10) => {
    if (!Number.isInteger(rounds) || rounds < 4 || rounds > 14) throw new Error('Rounds must be a whole number from 4 to 14.');
    const { default: bcrypt } = await import('bcryptjs');
    return bcrypt.hash(password, rounds);
};

export const bcryptCompare = async (password, hash) => {
    if (!/^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash.trim())) {
        throw new Error('That does not look like a bcrypt hash. It starts with $2a$, $2b$, $2x$ or $2y$ followed by the cost and is 60 characters long.');
    }
    const { default: bcrypt } = await import('bcryptjs');
    return bcrypt.compare(password, hash.trim());
};

// URL parser
export const parseUrl = (text) => {
    let url;
    try {
        url = new URL(text.trim());
    } catch {
        throw new Error('Enter a full URL including the scheme, e.g. https://example.com/path.');
    }
    return {
        href: url.href,
        protocol: url.protocol,
        username: url.username,
        password: url.password,
        host: url.host,
        hostname: url.hostname,
        port: url.port,
        origin: url.origin,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        params: [...url.searchParams.entries()]
    };
};

// IPv4
const ipToInt = (ip) => {
    const parts = ip.trim().split('.');
    if (parts.length !== 4 || parts.some((p) => !/^\d{1,3}$/.test(p) || Number(p) > 255)) throw new Error('Enter a valid IPv4 address, e.g. 192.168.1.10.');
    return parts.reduce((acc, p) => ((acc << 8) | Number(p)) >>> 0, 0);
};
const intToIp = (n) => [24, 16, 8, 0].map((shift) => (n >>> shift) & 255).join('.');

export const subnet = (input) => {
    const [ip, prefixText = '32'] = input.trim().split('/');
    const prefix = Number(prefixText);
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error('The prefix length must be from 0 to 32.');
    const address = ipToInt(ip);
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const network = (address & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const total = 2 ** (32 - prefix);
    const usable = prefix >= 31 ? total : Math.max(total - 2, 0);
    return {
        address: intToIp(address),
        cidr: `${intToIp(network)}/${prefix}`,
        netmask: intToIp(mask),
        wildcard: intToIp(~mask >>> 0),
        network: intToIp(network),
        broadcast: intToIp(broadcast),
        firstHost: intToIp(prefix >= 31 ? network : network + 1),
        lastHost: intToIp(prefix >= 31 ? broadcast : broadcast - 1),
        totalAddresses: total,
        usableHosts: usable
    };
};
