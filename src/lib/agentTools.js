// Machine-callable versions of the tools, shared by the WebMCP registration in the browser
// and the stdio MCP server in /mcp. Every tool has a JSON Schema and returns text.
import { base64Decode, base64Encode, binaryToText, csvToHtmlTable, csvToJson, formatJson, jsonToCsv, jsonToProperties, minifyJson, propertiesToJson, removeStopwords, textToBinary, textToHtmlList, toVanOphuijsen, uniqueWords } from './converters.js';
import { averageCost, capRate, concrete, dirt, formatMinutes, workMinutes } from './calculators.js';
import { buildAffiliateLink, buildHtmlLink, buildMetaTags, generatePassword, makeTitles, md5, memorablePassword, shaHash } from './generators.js';
import { extractLinks, htmlTablesToJson, htmlToText, xmlToJson } from './htmlTools.js';
import { applyLineTool, convertBase, convertUnit, describeColor, describeDate, fromRoman, lineTools, loremIpsum, octalToPermissions, parseDateInput, percentages, permissionsToOctal, permissionsToSymbolic, slugify, svgPlaceholder, textToNato, textToUnicode, toRoman, ulid, unicodeToText, uuidV4, uuidV7, UNITS } from './devUtils.js';
import { basicAuthHeader, bcryptCompare, bcryptHash, decodeJwt, hmac, parseUrl, passwordStrength, subnet, totp } from './netSecurity.js';
import { jsonToToml, jsonToXml, jsonToYaml, tomlToJson, tomlToYaml, yamlToJson, yamlToToml } from './formats.js';
import { explainCron, formatSql, jsonDiff, markdownToHtml, nextCronRuns, textDiff } from './formatters.js';
import { HTTP_STATUS, MIME_TYPES } from './reference.js';
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
        name: 'convert_data_format',
        description: 'Convert between JSON, YAML, TOML and XML (JSON to XML only). Dotted rules: TOML needs an object at the top level.',
        inputSchema: object({ text: string('Input document'), from: string('Source format', { enum: ['json', 'yaml', 'toml'] }), to: string('Target format', { enum: ['json', 'yaml', 'toml', 'xml'] }) }),
        run: ({ text, from, to }) => {
            if (from === to) throw new Error('Source and target format are the same.');
            const table = { 'yaml>json': yamlToJson, 'json>yaml': jsonToYaml, 'toml>json': tomlToJson, 'json>toml': jsonToToml, 'yaml>toml': yamlToToml, 'toml>yaml': tomlToYaml, 'json>xml': jsonToXml };
            const convert = table[`${from}>${to}`];
            if (!convert) throw new Error(`Converting ${from} to ${to} is not supported.`);
            return convert(text);
        }
    },
    {
        name: 'markdown_to_html',
        description: 'Convert GitHub flavored Markdown to HTML.',
        inputSchema: object({ markdown: string('Markdown text') }),
        run: ({ markdown }) => markdownToHtml(markdown)
    },
    {
        name: 'format_sql',
        description: 'Prettify a SQL query.',
        inputSchema: object({ sql: string('SQL text'), dialect: string('SQL dialect', { enum: ['sql', 'mysql', 'postgresql', 'sqlite', 'mariadb', 'transactsql', 'bigquery', 'plsql'] }) }, ['sql']),
        run: ({ sql, dialect = 'sql' }) => formatSql(sql, { language: dialect })
    },
    {
        name: 'text_diff',
        description: 'Compare two texts and return the changes as JSON parts with type added, removed or same.',
        inputSchema: object({ original: string('Original text'), changed: string('Changed text'), mode: string('Compare by', { enum: ['lines', 'words'] }) }, ['original', 'changed']),
        run: ({ original, changed, mode = 'lines' }) => out(textDiff(original, changed, { mode }))
    },
    {
        name: 'json_diff',
        description: 'Compare two JSON documents ignoring key order; returns diff parts as JSON.',
        inputSchema: object({ original: string('First JSON'), changed: string('Second JSON') }),
        run: ({ original, changed }) => out(jsonDiff(original, changed))
    },
    {
        name: 'regex_test',
        description: 'Run a JavaScript regular expression against text and list all matches with capture groups.',
        inputSchema: object({ pattern: string('Regular expression source'), text: string('Text to search'), flags: string('Flags such as "i" or "m"; "g" is always applied') }, ['pattern', 'text']),
        run: ({ pattern, text, flags = '' }) => {
            const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
            return out([...text.matchAll(regex)].slice(0, 500).map((m) => ({ match: m[0], index: m.index, groups: m.slice(1), named: m.groups ?? null })));
        }
    },
    {
        name: 'slugify',
        description: 'Turn text into a URL slug.',
        inputSchema: object({ text: string('Text to slugify'), separator: string('Separator, default "-"') }, ['text']),
        run: ({ text, separator = '-' }) => slugify(text, { separator })
    },
    {
        name: 'lorem_ipsum',
        description: 'Generate lorem ipsum placeholder text.',
        inputSchema: object({ unit: string('Unit', { enum: ['paragraphs', 'sentences', 'words'] }), count: number('Amount, default 3'), startWithLorem: bool('Start with "Lorem ipsum", default true') }, []),
        run: (args) => loremIpsum(args)
    },
    {
        name: 'generate_uuid',
        description: 'Generate UUIDs (v4 or v7) or ULIDs.',
        inputSchema: object({ type: string('Identifier type', { enum: ['v4', 'v7', 'ulid'] }), count: number('How many, 1 to 100, default 1') }, []),
        run: ({ type = 'v4', count = 1 }) => {
            const make = { v4: uuidV4, v7: uuidV7, ulid };
            if (!make[type]) throw new Error(`Unknown type "${type}".`);
            return Array.from({ length: Math.max(1, Math.min(count, 100)) }, () => make[type]()).join('\n');
        }
    },
    {
        name: 'nato_alphabet',
        description: 'Spell text with the NATO phonetic alphabet.',
        inputSchema: object({ text: string('Text to spell') }),
        run: ({ text }) => textToNato(text)
    },
    {
        name: 'unicode_code_points',
        description: 'Convert text to Unicode code points (U+0048) or decode code points and escapes back to text.',
        inputSchema: object({ text: string('Input'), mode: string('Direction', { enum: ['text_to_unicode', 'unicode_to_text'] }) }),
        run: ({ text, mode: m }) => (m === 'unicode_to_text' ? unicodeToText(text) : textToUnicode(text))
    },
    {
        name: 'line_tools',
        description: 'Sort, reverse, de-duplicate, shuffle, trim, remove empty lines or number the lines of a text.',
        inputSchema: object({ text: string('Lines of text'), operation: string('Operation', { enum: Object.keys(lineTools) }) }),
        run: ({ text, operation }) => {
            if (!lineTools[operation]) throw new Error(`Unknown operation "${operation}".`);
            return applyLineTool(text, operation);
        }
    },
    {
        name: 'color_convert',
        description: 'Convert a HEX, rgb() or hsl() color into HEX, RGB, HSL and CMYK.',
        inputSchema: object({ color: string('Color such as #1e90ff or rgb(30, 144, 255)') }),
        run: ({ color }) => out(describeColor(color))
    },
    {
        name: 'convert_base',
        description: 'Convert an integer between number bases 2 to 36 (arbitrarily large numbers supported).',
        inputSchema: object({ value: string('Number to convert'), from: number('Input base, 2-36'), to: number('Output base, 2-36') }),
        run: ({ value, from, to }) => convertBase(value, from, to)
    },
    {
        name: 'roman_numeral',
        description: 'Convert a number from 1 to 3999 to a Roman numeral, or a Roman numeral to a number.',
        inputSchema: object({ value: string('Number or Roman numeral') }),
        run: ({ value }) => (/^\d+$/.test(value.trim()) ? toRoman(value.trim()) : String(fromRoman(value)))
    },
    {
        name: 'timestamp_convert',
        description: 'Convert a Unix timestamp (seconds or milliseconds) or a date string into ISO 8601, UTC, local and relative formats.',
        inputSchema: object({ value: string('Timestamp or date string') }),
        run: ({ value }) => out(describeDate(parseDateInput(value)))
    },
    {
        name: 'unit_convert',
        description: 'Convert a value between units: length, mass, volume, speed, area, data, time and temperature.',
        inputSchema: object({ category: string('Category', { enum: Object.keys(UNITS) }), value: number('Value to convert'), from: string('Source unit, e.g. km, lb, °C'), to: string('Target unit') }),
        run: ({ category, value, from, to }) => String(convertUnit(category, value, from, to))
    },
    {
        name: 'percentage',
        description: 'Compute X% of Y, X as a percentage of Y, and the percentage change from X to Y.',
        inputSchema: object({ x: number('First number'), y: number('Second number') }),
        run: (args) => out(percentages(args))
    },
    {
        name: 'chmod_calculator',
        description: 'Convert octal Unix permissions (e.g. 755) into symbolic notation, or symbolic permissions into octal.',
        inputSchema: object({ value: string('Octal such as 755 or symbolic such as rwxr-xr-x') }),
        run: ({ value }) => {
            const v = value.trim().replace(/^-/, '');
            if (/^[rwx-]{9}$/.test(v)) {
                const permissions = [0, 3, 6].map((i) => ({ r: v[i] === 'r', w: v[i + 1] === 'w', x: v[i + 2] === 'x' }));
                return out({ octal: permissionsToOctal(permissions), symbolic: v });
            }
            const permissions = octalToPermissions(v);
            return out({ octal: v, symbolic: permissionsToSymbolic(permissions) });
        }
    },
    {
        name: 'subnet_calculator',
        description: 'Calculate IPv4 subnet details (network, broadcast, netmask, host range, host count) from CIDR notation.',
        inputSchema: object({ cidr: string('IPv4 address with prefix, e.g. 192.168.1.0/24') }),
        run: ({ cidr }) => out(subnet(cidr))
    },
    {
        name: 'cron_explain',
        description: 'Explain a 5 field cron expression in English and list its next run times (server local time).',
        inputSchema: object({ expression: string('Cron expression, e.g. "*/15 9-17 * * 1-5"'), runs: number('Number of upcoming runs, default 5') }, ['expression']),
        run: ({ expression, runs = 5 }) => out({ description: explainCron(expression), nextRuns: nextCronRuns(expression, Math.min(runs, 20)).map((d) => d.toISOString()) })
    },
    {
        name: 'jwt_decode',
        description: 'Decode a JSON Web Token (header, payload, expiry). The signature is NOT verified.',
        inputSchema: object({ token: string('JWT') }),
        run: ({ token }) => out(decodeJwt(token))
    },
    {
        name: 'hmac_sign',
        description: 'Compute an HMAC of a message with a secret key.',
        inputSchema: object({ message: string('Message'), key: string('Secret key'), algorithm: string('Hash', { enum: ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] }), encoding: string('Output encoding', { enum: ['hex', 'base64'] }) }, ['message', 'key']),
        run: ({ message, key, algorithm = 'SHA-256', encoding = 'hex' }) => hmac(message, key, algorithm, encoding)
    },
    {
        name: 'basic_auth_header',
        description: 'Build an HTTP Basic Authorization header.',
        inputSchema: object({ username: string('Username'), password: string('Password') }),
        run: ({ username, password }) => basicAuthHeader(username, password)
    },
    {
        name: 'totp_code',
        description: 'Compute the current time-based one-time password (RFC 6238) for a Base32 secret.',
        inputSchema: object({ secret: string('Base32 secret'), digits: number('Digits, default 6'), period: number('Period in seconds, default 30'), algorithm: string('Algorithm', { enum: ['SHA-1', 'SHA-256', 'SHA-512'] }) }, ['secret']),
        run: ({ secret, digits = 6, period = 30, algorithm = 'SHA-1' }) => totp({ secret, digits, period, algorithm })
    },
    {
        name: 'password_strength',
        description: 'Estimate the entropy and offline crack time of a password.',
        inputSchema: object({ password: string('Password to analyse') }),
        run: ({ password }) => out(passwordStrength(password))
    },
    {
        name: 'bcrypt',
        description: 'Hash a password with bcrypt, or verify a password against a bcrypt hash.',
        inputSchema: object({ password: string('Password'), hash: string('Existing bcrypt hash to compare against; omit to create a new hash'), rounds: number('Cost factor 4-14, default 10') }, ['password']),
        run: async ({ password, hash, rounds = 10 }) => (hash ? String(await bcryptCompare(password, hash)) : bcryptHash(password, rounds))
    },
    {
        name: 'parse_url',
        description: 'Split a URL into protocol, host, port, path, query parameters and hash.',
        inputSchema: object({ url: string('Full URL including scheme') }),
        run: ({ url }) => out(parseUrl(url))
    },
    {
        name: 'svg_placeholder',
        description: 'Create a placeholder image as SVG markup.',
        inputSchema: object({ width: number('Width in px'), height: number('Height in px'), background: string('Background color'), color: string('Text color'), text: string('Label text') }, []),
        run: (args) => svgPlaceholder(args)
    },
    {
        name: 'http_status',
        description: 'Look up HTTP status codes by code number or by words in the name or description.',
        inputSchema: object({ query: string('Code such as 404 or text such as "redirect"') }),
        run: ({ query }) => out(HTTP_STATUS.filter((s) => `${s.code} ${s.name} ${s.description}`.toLowerCase().includes(String(query).trim().toLowerCase())))
    },
    {
        name: 'mime_type',
        description: 'Look up MIME types by file extension or by type text.',
        inputSchema: object({ query: string('Extension such as png or text such as "application/json"') }),
        run: ({ query }) => out(MIME_TYPES.filter((m) => `${m.extension} ${m.type}`.includes(String(query).trim().toLowerCase().replace(/^\./, ''))))
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
