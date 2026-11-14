// Machine-callable versions of the tools, shared by the WebMCP registration in the browser
// and the stdio MCP server in /mcp. Every tool has a JSON Schema and returns text.
import { base64Decode, base64Encode, binaryToText, csvToHtmlTable, csvToJson, formatJson, jsonToCsv, jsonToProperties, minifyJson, propertiesToJson, removeStopwords, textToBinary, textToHtmlList, toVanOphuijsen, uniqueWords } from './converters.js';
import { averageCost, capRate, concrete, dirt, formatMinutes, workMinutes } from './calculators.js';
import { buildAffiliateLink, buildHtmlLink, buildMetaTags, generatePassword, makeTitles, md5, memorablePassword, shaHash } from './generators.js';
import { extractLinks, htmlTablesToJson, htmlToText, xmlToJson } from './htmlTools.js';
import { caseConverters, escapeHtml, escapeJs, escapeXml, replaceText, textStats, unescapeHtml, unescapeJs, unescapeXml, urlDecode, urlEncode } from './textUtils.js';

const string = (description, extra = {}) => ({ type: 'string', description, ...extra });
const number = (description, extra = {}) => ({ type: 'number', description, ...extra });
const bool = (description) => ({ type: 'boolean', description });
const object = (properties, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });

const mode = (a, b) => string(`Operation to perform: "${a}" or "${b}"`, { enum: [a, b] });
const out = (value) => (typeof value === 'string' ? value : JSON.stringify(value, null, 2));

const pair = (escape, unescape) => (args) => (args.mode === 'unescape' ? unescape(args.text) : escape(args.text));

/**
 * @typedef {{ name: string, description: string, inputSchema: object, dom?: boolean,
 *   run: (args: any) => string | Promise<string> }} AgentTool
 * `dom` marks tools that need DOMParser, so they are only available in the browser.
 */

/** @type {AgentTool[]} */
export const agentTools = [
    {
        name: 'html_escape',
        description: 'Escape or unescape HTML entities (& < > " \').',
        inputSchema: object({ text: string('Text to process'), mode: mode('escape', 'unescape') }),
        run: pair(escapeHtml, unescapeHtml)
    },
    {
        name: 'xml_escape',
        description: 'Escape or unescape XML special characters.',
        inputSchema: object({ text: string('Text to process'), mode: mode('escape', 'unescape') }),
        run: pair(escapeXml, unescapeXml)
    },
    {
        name: 'javascript_escape',
        description: 'Escape text for a JavaScript string literal, or decode JavaScript escape sequences.',
        inputSchema: object({ text: string('Text to process'), mode: mode('escape', 'unescape') }),
        run: pair(escapeJs, unescapeJs)
    },
    {
        name: 'url_encode',
        description: 'Percent-encode or decode text for URLs (encodeURIComponent).',
        inputSchema: object({ text: string('Text to process'), mode: mode('encode', 'decode') }),
        run: ({ text, mode: m }) => (m === 'decode' ? urlDecode(text) : urlEncode(text))
    },
    {
        name: 'change_case',
        description: 'Convert text between letter cases and naming styles.',
        inputSchema: object({ text: string('Text to convert'), style: string('Target case', { enum: Object.keys(caseConverters) }) }),
        run: ({ text, style }) => {
            if (!caseConverters[style]) throw new Error(`Unknown style "${style}".`);
            return caseConverters[style](text);
        }
    },
    {
        name: 'replace_text',
        description: 'Find and replace text. Returns JSON with the new text and the number of replacements.',
        inputSchema: object(
            { text: string('Text to search in'), find: string('Text or pattern to find'), replacement: string('Replacement text'), regex: bool('Treat find as a regular expression'), caseSensitive: bool('Case sensitive matching, default true') },
            ['text', 'find', 'replacement']
        ),
        run: ({ text, find, replacement, regex = false, caseSensitive = true }) => out(replaceText(text, find, replacement, { regex, caseSensitive }))
    },
    {
        name: 'text_statistics',
        description: 'Count words, unique words, sentences, paragraphs, lines and characters, and estimate reading time.',
        inputSchema: object({ text: string('Text to analyze') }),
        run: ({ text }) => out(textStats(text))
    },
    {
        name: 'remove_stopwords',
        description: 'Remove common English stopwords from text.',
        inputSchema: object({ text: string('Text to clean') }),
        run: ({ text }) => removeStopwords(text)
    },
    {
        name: 'unique_words',
        description: 'List the distinct words of a text, one per line, case-insensitively.',
        inputSchema: object({ text: string('Text to read'), sort: bool('Sort alphabetically') }, ['text']),
        run: ({ text, sort = false }) => uniqueWords(text, { sort })
    },
    {
        name: 'csv_to_json',
        description: 'Convert CSV (with quoted fields) to JSON.',
        inputSchema: object({ csv: string('CSV text'), delimiter: string('Field delimiter, default ","'), header: bool('First row is a header, default true') }, ['csv']),
        run: ({ csv, delimiter = ',', header = true }) => out(csvToJson(csv, { delimiter, header }))
    },
    {
        name: 'json_to_csv',
        description: 'Convert a JSON array of objects to CSV.',
        inputSchema: object({ json: string('JSON text'), delimiter: string('Field delimiter, default ","') }, ['json']),
        run: ({ json, delimiter = ',' }) => jsonToCsv(json, { delimiter })
    },
    {
        name: 'csv_to_html_table',
        description: 'Convert CSV to an HTML table.',
        inputSchema: object({ csv: string('CSV text'), delimiter: string('Field delimiter, default ","'), header: bool('First row is a header, default true') }, ['csv']),
        run: ({ csv, delimiter = ',', header = true }) => csvToHtmlTable(csv, { delimiter, header })
    },
    {
        name: 'text_to_html_list',
        description: 'Turn lines of text into an HTML list.',
        inputSchema: object({ text: string('One item per line'), ordered: bool('Use <ol> instead of <ul>') }, ['text']),
        run: ({ text, ordered = false }) => textToHtmlList(text, { ordered })
    },
    {
        name: 'json_format',
        description: 'Validate and prettify or minify JSON. Fails with a parse error for invalid JSON.',
        inputSchema: object({ json: string('JSON text'), minify: bool('Minify instead of prettify'), indent: number('Spaces of indentation when prettifying, default 2') }, ['json']),
        run: ({ json, minify = false, indent = 2 }) => (minify ? minifyJson(json) : formatJson(json, indent))
    },
    {
        name: 'json_properties',
        description: 'Convert between JSON and Java .properties format.',
        inputSchema: object({ text: string('Input text'), direction: string('Conversion direction', { enum: ['json_to_properties', 'properties_to_json'] }) }),
        run: ({ text, direction }) => (direction === 'properties_to_json' ? propertiesToJson(text) : jsonToProperties(text))
    },
    {
        name: 'base64',
        description: 'Encode or decode Base64 (UTF-8 safe, URL-safe variant supported).',
        inputSchema: object({ text: string('Text to process'), mode: mode('encode', 'decode'), urlSafe: bool('Use the URL-safe alphabet when encoding') }, ['text', 'mode']),
        run: ({ text, mode: m, urlSafe = false }) => (m === 'decode' ? base64Decode(text) : base64Encode(text, { urlSafe }))
    },
    {
        name: 'binary_translator',
        description: 'Translate text to 8-bit binary (UTF-8) or binary back to text.',
        inputSchema: object({ text: string('Text or binary digits'), mode: string('Direction', { enum: ['text_to_binary', 'binary_to_text'] }) }),
        run: ({ text, mode: m }) => (m === 'binary_to_text' ? binaryToText(text) : textToBinary(text))
    },
    {
        name: 'van_ophuijsen_spelling',
        description: 'Convert modern Indonesian spelling to the Van Ophuijsen spelling (j to dj, y to j, u to oe, ...).',
        inputSchema: object({ text: string('Modern Indonesian text') }),
        run: ({ text }) => toVanOphuijsen(text)
    },
    {
        name: 'html_to_text',
        description: 'Strip HTML tags, scripts and styles and return plain text. Browser only.',
        dom: true,
        inputSchema: object({ html: string('HTML to convert') }),
        run: ({ html }) => htmlToText(html)
    },
    {
        name: 'extract_html_links',
        description: 'Extract all links (text and href) from HTML. Browser only.',
        dom: true,
        inputSchema: object({ html: string('HTML to read') }),
        run: ({ html }) => out(extractLinks(html))
    },
    {
        name: 'html_table_to_json',
        description: 'Extract the tables of an HTML document as JSON. Browser only.',
        dom: true,
        inputSchema: object({ html: string('HTML containing a table') }),
        run: ({ html }) => out(htmlTablesToJson(html))
    },
    {
        name: 'xml_to_json',
        description: 'Convert XML to JSON (attributes are prefixed with @). Browser only.',
        dom: true,
        inputSchema: object({ xml: string('XML to convert') }),
        run: ({ xml }) => xmlToJson(xml)
    },
    {
        name: 'generate_password',
        description: 'Generate a random password with a cryptographically secure generator.',
        inputSchema: object(
            { length: number('Length, default 16', { minimum: 4, maximum: 128 }), lower: bool('Include a-z, default true'), upper: bool('Include A-Z, default true'), digits: bool('Include 0-9, default true'), symbols: bool('Include symbols, default true'), excludeAmbiguous: bool('Exclude look-alike characters') },
            []
        ),
        run: (args) => generatePassword(args)
    },
    {
        name: 'generate_memorable_password',
        description: 'Generate a passphrase made of random words.',
        inputSchema: object({ words: number('Number of words, default 4', { minimum: 2, maximum: 10 }), separator: string('Separator, default "-"'), capitalize: bool('Capitalize words, default true'), addNumber: bool('Append a number, default true') }, []),
        run: (args) => memorablePassword(args)
    },
    {
        name: 'hash_text',
        description: 'Hash text with MD5, SHA-1, SHA-256 or SHA-512 and return the hex digest.',
        inputSchema: object({ text: string('Text to hash'), algorithm: string('Hash algorithm', { enum: ['md5', 'sha1', 'sha256', 'sha512'] }) }),
        run: async ({ text, algorithm }) => {
            if (algorithm === 'md5') return md5(text);
            const names = { sha1: 'SHA-1', sha256: 'SHA-256', sha512: 'SHA-512' };
            if (!names[algorithm]) throw new Error(`Unknown algorithm "${algorithm}".`);
            return shaHash(text, names[algorithm]);
        }
    },
    {
        name: 'meta_tags',
        description: 'Generate SEO, Open Graph and Twitter card meta tags.',
        inputSchema: object({ title: string('Page title'), description: string('Page description'), keywords: string('Comma separated keywords'), author: string('Author'), url: string('Canonical URL'), image: string('Share image URL'), siteName: string('Site name') }, ['title']),
        run: (args) => buildMetaTags(args)
    },
    {
        name: 'title_ideas',
        description: 'Suggest page title ideas for a topic.',
        inputSchema: object({ topic: string('Topic or keyword') }),
        run: ({ topic }) => makeTitles(topic).join('\n')
    },
    {
        name: 'html_link',
        description: 'Build an HTML anchor tag.',
        inputSchema: object({ url: string('Link URL'), text: string('Link text'), newTab: bool('Open in a new tab'), nofollow: bool('Add rel="nofollow"'), title: string('Title attribute') }, ['url']),
        run: (args) => buildHtmlLink(args)
    },
    {
        name: 'affiliate_link',
        description: 'Build an Amazon or Audible product link from an ASIN and an affiliate tag.',
        inputSchema: object({ store: string('Store', { enum: ['amazon', 'audible'] }), asin: string('10 character ASIN'), tag: string('Affiliate tag'), domain: string('Optional store domain, e.g. www.amazon.de') }, ['store', 'asin']),
        run: ({ store, asin, tag = '', domain }) => buildAffiliateLink({ store, id: asin, tag, domain })
    },
    {
        name: 'concrete_calculator',
        description: 'Estimate concrete volume (cubic yards, meters, feet) and 60/80 lb bags for a slab.',
        inputSchema: object(
            { length: number('Length'), width: number('Width'), depth: number('Thickness'), lengthUnit: string('Unit of length and width', { enum: ['ft', 'yd', 'm', 'in', 'cm'] }), depthUnit: string('Unit of thickness', { enum: ['in', 'ft', 'cm', 'm'] }), wastePercent: number('Extra for waste in percent, default 10') },
            ['length', 'width', 'depth']
        ),
        run: (args) => out(concrete(args))
    },
    {
        name: 'dirt_calculator',
        description: 'Estimate the volume and approximate weight of dirt needed to cover an area.',
        inputSchema: object(
            { length: number('Length'), width: number('Width'), depth: number('Depth'), lengthUnit: string('Unit of length and width', { enum: ['ft', 'yd', 'm', 'in', 'cm'] }), depthUnit: string('Unit of depth', { enum: ['in', 'ft', 'cm', 'm'] }), wastePercent: number('Extra in percent, default 0') },
            ['length', 'width', 'depth']
        ),
        run: (args) => out(dirt(args))
    },
    {
        name: 'cap_rate',
        description: 'Calculate the capitalization rate and net operating income of a property.',
        inputSchema: object({ price: number('Property price'), income: number('Annual gross income'), expenses: number('Annual operating expenses') }, ['price', 'income']),
        run: (args) => out(capRate(args))
    },
    {
        name: 'average_cost',
        description: 'Average buy price across several purchases (for example cryptocurrency).',
        inputSchema: object({ purchases: { type: 'array', description: 'Purchases', items: object({ amount: number('Amount bought'), price: number('Price per unit') }) } }),
        run: ({ purchases }) => out(averageCost(purchases))
    },
    {
        name: 'work_hours',
        description: 'Hours worked between two HH:MM times minus a break; an end before the start means an overnight shift.',
        inputSchema: object({ start: string('Start time HH:MM'), end: string('End time HH:MM'), breakMinutes: number('Break in minutes') }, ['start', 'end']),
        run: ({ start, end, breakMinutes = 0 }) => {
            const minutes = workMinutes(start, end, breakMinutes);
            return out({ minutes, formatted: formatMinutes(minutes), decimalHours: Number((minutes / 60).toFixed(2)) });
        }
    },
    {
        name: 'qr_code_svg',
        description: 'Generate a QR code and return it as SVG markup.',
        inputSchema: object({ text: string('Content to encode'), errorCorrectionLevel: string('Error correction', { enum: ['L', 'M', 'Q', 'H'] }) }, ['text']),
        run: async ({ text, errorCorrectionLevel = 'M' }) => {
            const { default: QRCode } = await import('qrcode');
            return QRCode.toString(text, { type: 'svg', errorCorrectionLevel });
        }
    }
];

export const findAgentTool = (name) => agentTools.find((tool) => tool.name === name);

/** Runs a tool by name and always resolves to text, throwing on unknown tools or invalid input. */
export const callAgentTool = async (name, args = {}) => {
    const tool = findAgentTool(name);
    if (!tool) throw new Error(`Unknown tool "${name}".`);
    for (const key of tool.inputSchema.required ?? []) {
        if (args[key] === undefined) throw new Error(`Missing required argument "${key}".`);
    }
    return out(await tool.run(args));
};
