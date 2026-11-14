import SparkMD5 from 'spark-md5';
import { pick, randomInt, shuffle } from './random.js';

// Passwords
const SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.?/'
};
const AMBIGUOUS = /[O0oIl1|]/g;

export const generatePassword = ({ length = 16, lower = true, upper = true, digits = true, symbols = true, excludeAmbiguous = false } = {}) => {
    const enabled = Object.entries({ lower, upper, digits, symbols })
        .filter(([, on]) => on)
        .map(([name]) => (excludeAmbiguous ? SETS[name].replace(AMBIGUOUS, '') : SETS[name]));
    if (enabled.length === 0) throw new Error('Select at least one character type.');
    if (length < enabled.length) throw new Error(`Length must be at least ${enabled.length}.`);

    const all = enabled.join('');
    // Guarantee one character of each selected type, then fill and shuffle.
    const chars = enabled.map((set) => pick([...set]));
    while (chars.length < length) chars.push(all[randomInt(all.length)]);
    return shuffle(chars).join('');
};

export const passwordEntropyBits = (length, poolSize) => Math.round(length * Math.log2(poolSize));

export const WORDS = `able acid aged also area army away baby back ball band bank base bath bear beat bell belt best bird blue boat body bone book boot born both bowl brave bread brick bridge bright brown build burn cabin cake calm camp candy card care cart cave chair chalk charm cheese chief city clay clean clear clock cloud coast coin cold color cook cool copper coral corn cover craft crane crisp crown daily dance dark dawn deep deer desk dust eagle earth east easy echo edge ember engine fair farm fast fern field fire fish flag flame floor flower fog forest fox frost fruit game garden gate gift glass gold grain grape grass green grove hammer happy harbor hawk heart hill honey horse house ice idea iron island ivory jade jelly jewel joy jungle kind king kite lake lamp land leaf lemon light lily lion lunar maple marble meadow melon metal mint moon moss mountain music night noble north nova oak ocean olive orange otter owl paint paper pearl pine planet plum pond pride quartz queen quick quiet rabbit rain raven red reed river road robin rock rose round ruby sage sail salt sand silver sky snow solar spark spice spring star stone storm sugar summer sun swan tea tiger tower trail tree tulip valley velvet violet water wave west wheat wild wind winter wolf wood yellow zebra zinc`.split(/\s+/);

export const memorablePassword = ({ words = 4, separator = '-', capitalize = true, addNumber = true } = {}) => {
    const parts = Array.from({ length: words }, () => {
        const word = pick(WORDS);
        return capitalize ? word[0].toUpperCase() + word.slice(1) : word;
    });
    if (addNumber) parts.push(String(randomInt(100)).padStart(2, '0'));
    return parts.join(separator);
};

// Hashes
export const md5 = (text) => SparkMD5.hash(text);

export const shaHash = async (text, algorithm) => {
    const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

// SEO
export const makeTitles = (topic, { year = new Date().getFullYear() } = {}) => {
    const t = topic.trim();
    if (!t) return [];
    const templates = [
        `The Ultimate Guide to ${t} (${year})`,
        `${t}: Everything You Need to Know`,
        `10 Proven Tips for ${t}`,
        `How to Get Started with ${t} in ${year}`,
        `${t} Explained: A Beginner's Guide`,
        `Best ${t} Tools and Resources for ${year}`,
        `Why ${t} Matters More Than Ever`,
        `${t} Mistakes to Avoid`,
        `${t} vs. the Alternatives: What Should You Choose?`,
        `Step-by-Step ${t} Tutorial`,
        `The Complete ${t} Checklist`,
        `${t} Made Simple`
    ];
    return templates;
};

const attr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export const buildMetaTags = ({ title, description, keywords, author, url, image, siteName, robots = 'index, follow', twitterCard = 'summary_large_image' }) => {
    const lines = ['<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">'];
    if (title) lines.push(`<title>${attr(title)}</title>`);
    if (description) lines.push(`<meta name="description" content="${attr(description)}">`);
    if (keywords) lines.push(`<meta name="keywords" content="${attr(keywords)}">`);
    if (author) lines.push(`<meta name="author" content="${attr(author)}">`);
    if (robots) lines.push(`<meta name="robots" content="${attr(robots)}">`);
    if (url) lines.push(`<link rel="canonical" href="${attr(url)}">`);
    if (title) lines.push(`<meta property="og:title" content="${attr(title)}">`);
    if (description) lines.push(`<meta property="og:description" content="${attr(description)}">`);
    if (url) lines.push(`<meta property="og:url" content="${attr(url)}">`);
    if (siteName) lines.push(`<meta property="og:site_name" content="${attr(siteName)}">`);
    if (image) lines.push(`<meta property="og:image" content="${attr(image)}">`);
    lines.push('<meta property="og:type" content="website">');
    lines.push(`<meta name="twitter:card" content="${attr(twitterCard)}">`);
    if (title) lines.push(`<meta name="twitter:title" content="${attr(title)}">`);
    if (description) lines.push(`<meta name="twitter:description" content="${attr(description)}">`);
    if (image) lines.push(`<meta name="twitter:image" content="${attr(image)}">`);
    return lines.join('\n');
};

export const buildHtmlLink = ({ url, text, newTab = false, nofollow = false, title = '' }) => {
    const rel = [newTab && 'noopener', newTab && 'noreferrer', nofollow && 'nofollow'].filter(Boolean).join(' ');
    const attrs = [`href="${attr(url)}"`, title && `title="${attr(title)}"`, newTab && 'target="_blank"', rel && `rel="${rel}"`].filter(Boolean);
    return `<a ${attrs.join(' ')}>${String(text || url).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</a>`;
};

// Name generators
const TEAM_ADJECTIVES = ['Mighty', 'Fearless', 'Rapid', 'Electric', 'Savage', 'Cosmic', 'Thunder', 'Iron', 'Silent', 'Blazing', 'Crimson', 'Phantom', 'Lucky', 'Wild', 'Atomic', 'Golden', 'Stealth', 'Radical', 'Epic', 'Unstoppable'];
const TEAM_NOUNS = ['Wolves', 'Dragons', 'Falcons', 'Titans', 'Ninjas', 'Sharks', 'Vipers', 'Panthers', 'Legends', 'Rebels', 'Comets', 'Knights', 'Phoenix', 'Hawks', 'Storm', 'Raiders', 'Giants', 'Cobras', 'Strikers', 'Avengers'];

export const teamNames = (count = 10) => {
    const names = new Set();
    while (names.size < Math.min(count, TEAM_ADJECTIVES.length * TEAM_NOUNS.length)) {
        names.add(`${pick(TEAM_ADJECTIVES)} ${pick(TEAM_NOUNS)}`);
    }
    return [...names];
};

const BIZ_PREFIX = ['Urban', 'Nova', 'Pure', 'Bright', 'Swift', 'Prime', 'Lush', 'Vivid', 'Zen', 'Peak', 'Bold', 'Opal', 'Terra', 'Luna', 'Aero', 'Craft', 'Fresh', 'Alpha', 'True', 'Maple'];
const BIZ_SUFFIX = ['Mart', 'Hub', 'Collective', 'Supply', 'Shop', 'Co', 'Goods', 'Studio', 'Market', 'House', 'Outlet', 'Emporium', 'Depot', 'Lane', 'Works', 'Boutique', 'Store', 'Labs', 'Trading', 'Provisions'];

export const businessNames = (keyword = '', count = 10) => {
    const word = keyword.trim().replace(/\s+/g, ' ');
    const cap = word ? word[0].toUpperCase() + word.slice(1) : '';
    const names = new Set();
    const max = BIZ_PREFIX.length * BIZ_SUFFIX.length;
    while (names.size < Math.min(count, max)) {
        const roll = randomInt(word ? 3 : 1);
        if (roll === 0) names.add(`${pick(BIZ_PREFIX)}${pick(BIZ_SUFFIX)}`);
        else if (roll === 1) names.add(`${pick(BIZ_PREFIX)} ${cap}`);
        else names.add(`${cap} ${pick(BIZ_SUFFIX)}`);
        if (word && names.size >= count) break;
    }
    return [...names];
};

// Marketplace links
export const buildAffiliateLink = ({ store, id, tag, domain }) => {
    const asin = id.trim().toUpperCase();
    if (!/^[A-Z0-9]{10}$/.test(asin)) throw new Error('Enter a valid 10 character ASIN.');
    const host = domain || (store === 'audible' ? 'www.audible.com' : 'www.amazon.com');
    const path = store === 'audible' ? 'pd' : 'dp';
    const query = tag.trim() ? `?tag=${encodeURIComponent(tag.trim())}` : '';
    return `https://${host}/${path}/${asin}${query}`;
};

// Feedback templates
const FEEDBACK = {
    amazon: {
        positive: ['Fast shipping and the item arrived exactly as described. Highly recommended seller!', 'Great product, well packaged and delivered on time. Would buy again.', 'Excellent communication and quality. Five stars!'],
        neutral: ['The item was as described, though shipping took a bit longer than expected.', 'Product is okay for the price. Packaging could be better.'],
        negative: ['The item did not match the description and arrived late. Disappointed with this order.', 'Product quality was below expectations and support was slow to respond.']
    },
    ebay: {
        positive: ['A+ seller! Fast shipping, item exactly as described, smooth transaction. Thank you!', 'Great buyer, quick payment and clear communication. Pleasure to deal with!', 'Perfect transaction. Item in excellent condition and shipped quickly.'],
        neutral: ['Item was as described, but shipping was slower than expected.', 'Transaction completed. Communication could have been faster.'],
        negative: ['Item not as described and the seller was slow to respond. Would not recommend.', 'Buyer was slow to pay and communication was poor.']
    },
    fiverr: {
        positive: ['Amazing work delivered on time! Professional, responsive and exactly what I needed. Will order again.', 'Great communication and top quality delivery. Highly recommended seller!', 'Buyer was clear with requirements, responsive and a pleasure to work with. Welcome back anytime!'],
        neutral: ['The work was acceptable but needed a few revisions to match the brief.', 'Delivery was on time, but communication could have been clearer.'],
        negative: ['The delivery did not match the agreed brief and revisions took too long.', 'Requirements changed repeatedly after the order started, which made delivery difficult.']
    }
};

export const feedbackOptions = (platform, tone) => FEEDBACK[platform]?.[tone] ?? [];

// jQuery snippets
export const JQUERY_VERSIONS = ['3.7.1', '3.6.4', '3.5.1', '2.2.4', '1.12.4'];

export const jquerySnippets = (version = '3.7.1') => [
    { title: 'jQuery CDN (code.jquery.com)', code: `<script src="https://code.jquery.com/jquery-${version}.min.js"></script>` },
    { title: 'jQuery CDN (jsDelivr)', code: `<script src="https://cdn.jsdelivr.net/npm/jquery@${version}/dist/jquery.min.js"></script>` },
    { title: 'jQuery CDN (cdnjs)', code: `<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/${version}/jquery.min.js"></script>` },
    { title: 'Document ready', code: `$(function () {\n  // DOM is ready\n});` },
    { title: 'Click handler', code: `$('#button').on('click', function (event) {\n  event.preventDefault();\n});` },
    { title: 'AJAX GET request', code: `$.ajax({\n  url: '/api/data',\n  method: 'GET',\n  dataType: 'json'\n}).done(function (data) {\n  console.log(data);\n}).fail(function (xhr, status, error) {\n  console.error(error);\n});` },
    { title: 'Toggle class', code: `$('.element').toggleClass('active');` },
    { title: 'Fade in / out', code: `$('#box').fadeIn(300);\n$('#box').fadeOut(300);` }
];
