// Single source of truth for every tool, used by the sidebar, home page and category pages.

export const categories = [
    {
        id: 'string',
        name: 'String Tools',
        sidebarName: 'String Utility',
        description: 'Text manipulation and processing utilities',
        icon: 'regex'
    },
    {
        id: 'converter',
        name: 'Converters',
        sidebarName: 'Converter',
        description: 'Format conversion and transformation tools',
        icon: 'arrow-left-right'
    },
    {
        id: 'security',
        name: 'Security & Privacy',
        sidebarName: 'Security & Privacy',
        description: 'Password generators and hash calculators',
        icon: 'shield-lock'
    },
    {
        id: 'seo',
        name: 'SEO Tools',
        sidebarName: 'SEO',
        description: 'Titles and meta tags for better search results',
        icon: 'graph-up-arrow'
    },
    {
        id: 'generator',
        name: 'Code Generators',
        sidebarName: 'Code Generators',
        description: 'Generate code, codes, links and names',
        icon: 'code-square'
    },
    {
        id: 'calculator',
        name: 'Calculators',
        sidebarName: 'Calculators',
        description: 'Handy calculators and counters',
        icon: 'calculator'
    },
    {
        id: 'games',
        name: 'Games',
        sidebarName: 'Play Games',
        description: 'Quick games for a break',
        icon: 'controller'
    },
    {
        id: 'testing',
        name: 'Testing Tools',
        sidebarName: 'Testing',
        description: 'API testing and debugging utilities',
        icon: 'bug'
    }
];

export const tools = [
    {
        category: 'string',
        slug: 'html-escape',
        title: 'HTML Escape/Unescape',
        sidebarName: 'HTML Escape',
        description: 'Safely encode or decode HTML entities to prevent XSS attacks',
        icon: 'code-slash',
        features: ['HTML Encoding', 'HTML Decoding', 'XSS Prevention']
    },
    {
        category: 'string',
        slug: 'js-escape-unescape',
        title: 'JavaScript Escape/Unescape',
        sidebarName: 'JavaScript Escape',
        description: 'Escape JavaScript strings for safe embedding in code or JSON',
        icon: 'braces',
        features: ['JS String Escaping', 'Unicode Escapes', 'Code Embedding']
    },
    {
        category: 'string',
        slug: 'xml-escape-unescape',
        title: 'XML Escape/Unescape',
        sidebarName: 'XML Escape',
        description: 'Escape or unescape XML special characters for safe data transmission',
        icon: 'file-earmark-code',
        features: ['XML Encoding', 'XML Decoding', 'Safe Data Transfer']
    },
    {
        category: 'string',
        slug: 'url-encode-decode',
        title: 'URL Encode/Decode',
        sidebarName: 'URL Encode | Decode',
        description: 'Encode or decode URLs for safe transmission over the internet',
        icon: 'link-45deg',
        features: ['URL Encoding', 'URL Decoding', 'Web Safe URLs']
    },
    {
        category: 'string',
        slug: 'change-case',
        title: 'Text Case Converter',
        sidebarName: 'Change Case',
        description: 'Convert text between upper, lower, title, camel, snake and kebab case',
        icon: 'type',
        features: ['Title Case', 'camelCase', 'snake_case', 'kebab-case']
    },
    {
        category: 'string',
        slug: 'replace-text',
        title: 'Replace Text',
        sidebarName: 'Replace Text',
        description: 'Find and replace text, with optional regular expressions',
        icon: 'search',
        features: ['Plain Text', 'Regex', 'Case Sensitivity']
    },
    {
        category: 'string',
        slug: 'word-counter',
        title: 'Word Counter',
        sidebarName: 'Word Count',
        description: 'Count words, characters and get detailed text statistics',
        icon: 'calculator',
        features: ['Words', 'Characters', 'Reading Time']
    },
    {
        category: 'converter',
        slug: 'csv-to-json',
        title: 'CSV to JSON',
        sidebarName: 'CSV To JSON',
        description: 'Convert CSV data to JSON, with quoted fields and custom delimiters',
        icon: 'filetype-json',
        features: ['Quoted Fields', 'Custom Delimiter', 'Download']
    },
    {
        category: 'converter',
        slug: 'before-eyd',
        title: 'Van Ophuijsen Indonesian',
        sidebarName: 'Van Ophuijsen Indonesian',
        description: 'Convert modern Indonesian spelling into the Van Ophuijsen spelling',
        icon: 'translate',
        features: ['Live Conversion', 'Keeps Casing']
    },
    {
        category: 'converter',
        slug: 'base64',
        title: 'Base64 Encode/Decode',
        sidebarName: 'Base64',
        description: 'Encode or decode Base64, including URL-safe Base64 and Unicode text',
        icon: 'file-earmark-binary',
        features: ['UTF-8 Safe', 'URL-safe Variant']
    },
    {
        category: 'converter',
        slug: 'json-formatter',
        title: 'JSON Formatter',
        sidebarName: 'JSON Formatter',
        description: 'Validate, prettify or minify JSON with clear error messages',
        icon: 'braces-asterisk',
        features: ['Validate', 'Prettify', 'Minify']
    },
    {
        category: 'string',
        slug: 'remove-stopwords',
        title: 'Remove Stopwords',
        sidebarName: 'Remove Stopwords',
        description: 'Strip common English filler words from your text',
        icon: 'funnel'
    },
    {
        category: 'converter',
        slug: 'json-to-csv',
        title: 'JSON to CSV',
        sidebarName: 'JSON To CSV',
        description: 'Convert a JSON array of objects into CSV',
        icon: 'filetype-csv'
    },
    {
        category: 'converter',
        slug: 'csv-to-html-table',
        title: 'CSV to HTML Table',
        sidebarName: 'CSV To HTML Table',
        description: 'Turn CSV data into a ready-to-paste HTML table',
        icon: 'table'
    },
    {
        category: 'converter',
        slug: 'html-table-to-json',
        title: 'HTML Table to JSON',
        sidebarName: 'HTML Table To JSON',
        description: 'Extract the data of HTML tables as JSON',
        icon: 'table'
    },
    {
        category: 'converter',
        slug: 'html-to-text',
        title: 'HTML to Text',
        sidebarName: 'HTML To Text',
        description: 'Strip HTML tags and get clean plain text',
        icon: 'file-earmark-text'
    },
    {
        category: 'converter',
        slug: 'html-link-extractor',
        title: 'HTML Link Extractor',
        sidebarName: 'HTML Link Extractor',
        description: 'Pull every link and its text out of HTML',
        icon: 'link'
    },
    {
        category: 'converter',
        slug: 'create-html-link',
        title: 'Create HTML Link',
        sidebarName: 'Create HTML Link',
        description: 'Build an HTML anchor tag with rel and target options',
        icon: 'link-45deg'
    },
    {
        category: 'converter',
        slug: 'text-to-html-list',
        title: 'Text to HTML List',
        sidebarName: 'Text To HTML List',
        description: 'Turn lines of text into an ordered or unordered HTML list',
        icon: 'list-ul'
    },
    {
        category: 'converter',
        slug: 'xml-to-json',
        title: 'XML to JSON',
        sidebarName: 'XML To JSON',
        description: 'Convert XML into JSON, keeping attributes',
        icon: 'filetype-xml'
    },
    {
        category: 'converter',
        slug: 'json-to-property',
        title: 'JSON to Properties',
        sidebarName: 'JSON To Property',
        description: 'Flatten JSON into Java-style .properties lines',
        icon: 'file-earmark-code'
    },
    {
        category: 'converter',
        slug: 'property-to-json',
        title: 'Properties to JSON',
        sidebarName: 'Property to JSON',
        description: 'Convert .properties files into nested JSON',
        icon: 'file-earmark-code'
    },
    {
        category: 'converter',
        slug: 'image-to-base64',
        title: 'Image to Base64',
        sidebarName: 'Image To Base-64',
        description: 'Encode an image as a Base64 data URI',
        icon: 'image'
    },
    {
        category: 'converter',
        slug: 'heic-converter',
        title: 'HEIC to JPG / PNG / GIF',
        sidebarName: 'HEIC to JPG / PNG / GIF',
        description: 'Convert HEIC photos into common image formats',
        icon: 'images'
    },
    {
        category: 'converter',
        slug: 'heic-to-pdf',
        title: 'HEIC to PDF',
        sidebarName: 'HEIC to PDF',
        description: 'Combine HEIC photos into a PDF',
        icon: 'file-earmark-pdf'
    },
    {
        category: 'converter',
        slug: 'jpeg-to-pdf',
        title: 'JPEG to PDF',
        sidebarName: 'JPEG to PDF',
        description: 'Combine JPEG images into a PDF',
        icon: 'file-earmark-pdf'
    },
    {
        category: 'converter',
        slug: 'webp-to-pdf',
        title: 'WEBP to PDF',
        sidebarName: 'WEBP to PDF',
        description: 'Combine WEBP images into a PDF',
        icon: 'file-earmark-pdf'
    },
    {
        category: 'converter',
        slug: 'png-to-pdf',
        title: 'PNG to PDF',
        sidebarName: 'PNG to PDF',
        description: 'Combine PNG images into a PDF',
        icon: 'file-earmark-pdf'
    },
    {
        category: 'converter',
        slug: 'binary-translator',
        title: 'Binary Translator',
        sidebarName: 'Binary Translator',
        description: 'Translate text to binary and back',
        icon: 'cpu'
    },
    {
        category: 'converter',
        slug: 'unique-word-extractor',
        title: 'Unique Word Extractor',
        sidebarName: 'Unique Word Extractor',
        description: 'List the distinct words used in a text',
        icon: 'list-check'
    },
    {
        category: 'converter',
        slug: 'todo-list-maker',
        title: 'To Do List Maker',
        sidebarName: 'To Do List Maker',
        description: 'Keep a simple to-do list saved in your browser',
        icon: 'check2-square'
    },
    {
        category: 'security',
        slug: 'password-generator',
        title: 'Password Generator',
        sidebarName: 'Password Generator',
        description: 'Generate random, strong passwords',
        icon: 'key'
    },
    {
        category: 'security',
        slug: 'memorable-password',
        title: 'Memorable Password',
        sidebarName: 'Memorable Password',
        description: 'Generate secure passwords that are easy to remember',
        icon: 'chat-quote'
    },
    {
        category: 'security',
        slug: 'md5',
        title: 'Calculate MD5',
        sidebarName: 'Calculate MD5',
        description: 'Compute MD5 and SHA hashes of text or files',
        icon: 'fingerprint'
    },
    {
        category: 'seo',
        slug: 'title-maker',
        title: 'Title Maker',
        sidebarName: 'Title Maker',
        description: 'Get page title ideas for any topic',
        icon: 'type-h1'
    },
    {
        category: 'seo',
        slug: 'meta-tags',
        title: 'Meta Tags Generator',
        sidebarName: 'Meta Tags',
        description: 'Generate SEO, Open Graph and Twitter meta tags',
        icon: 'tags'
    },
    {
        category: 'generator',
        slug: 'css-button-generator',
        title: 'CSS Button Generator',
        sidebarName: 'CSS Button Generator',
        description: 'Design a button and copy the CSS and HTML',
        icon: 'square'
    },
    {
        category: 'generator',
        slug: 'qr-code-generator',
        title: 'QR Code Generator',
        sidebarName: 'QR Code Generator',
        description: 'Create QR codes and download them as PNG or SVG',
        icon: 'qr-code'
    },
    {
        category: 'generator',
        slug: 'barcode-generator',
        title: 'Barcode Generator',
        sidebarName: 'Bar Code Generator',
        description: 'Create barcodes in popular formats',
        icon: 'upc-scan'
    },
    {
        category: 'generator',
        slug: 'jquery-code-grabber',
        title: 'jQuery Code Grabber',
        sidebarName: 'jQuery Code Grabber',
        description: 'Copy jQuery CDN tags and quick-start snippets',
        icon: 'filetype-js'
    },
    {
        category: 'generator',
        slug: 'amazon-link-maker',
        title: 'Amazon Link Maker',
        sidebarName: 'Amazon Link Maker',
        description: 'Build Amazon product links with your affiliate tag',
        icon: 'link'
    },
    {
        category: 'generator',
        slug: 'audible-link-maker',
        title: 'Audible Link Maker',
        sidebarName: 'Audible Link Maker',
        description: 'Build Audible links with your affiliate tag',
        icon: 'headphones'
    },
    {
        category: 'generator',
        slug: 'amazon-feedback-maker',
        title: 'Amazon Feedback Maker',
        sidebarName: 'Amazon Feedback Maker',
        description: 'Generate ready-made Amazon feedback text',
        icon: 'chat-square-text'
    },
    {
        category: 'generator',
        slug: 'ebay-feedback-maker',
        title: 'eBay Feedback Maker',
        sidebarName: 'eBay Feedback Maker',
        description: 'Generate ready-made eBay feedback text',
        icon: 'chat-square-text'
    },
    {
        category: 'generator',
        slug: 'fiverr-feedback-maker',
        title: 'Fiverr Feedback Maker',
        sidebarName: 'Fiverr Feedback Maker',
        description: 'Generate ready-made Fiverr feedback text',
        icon: 'chat-square-text'
    },
    {
        category: 'generator',
        slug: 'team-name-generator',
        title: 'Cool Team Name Generator',
        sidebarName: 'Cool Team Name Generator',
        description: 'Get cool team name ideas',
        icon: 'people'
    },
    {
        category: 'generator',
        slug: 'business-name-generator',
        title: 'Shopify Business Name Generator',
        sidebarName: 'Shopify Business Name Generator',
        description: 'Get store name ideas from a keyword',
        icon: 'shop'
    },
    {
        category: 'calculator',
        slug: 'crypto-avg-calculator',
        title: 'Crypto Average Calculator',
        sidebarName: 'Crypto Avg Calculator',
        description: 'Find your average buy price across purchases',
        icon: 'currency-bitcoin'
    },
    {
        category: 'calculator',
        slug: 'csv-crypto-avg-calculator',
        title: 'CSV Crypto Average Calculator',
        sidebarName: 'CSV Crypto Avg Calculator',
        description: 'Paste many purchases and get your average cost',
        icon: 'currency-bitcoin'
    },
    {
        category: 'calculator',
        slug: 'work-hour-calculator',
        title: 'Work Hour Calculator',
        sidebarName: 'Work Hour Calculator',
        description: 'Total your daily and weekly work hours',
        icon: 'clock-history'
    },
    {
        category: 'calculator',
        slug: 'concrete-calculator',
        title: 'Concrete Calculator',
        sidebarName: 'Concrete Calculator',
        description: 'Estimate the concrete and bags you need',
        icon: 'bricks'
    },
    {
        category: 'calculator',
        slug: 'dirt-calculator',
        title: 'Dirt Calculator',
        sidebarName: 'Dirt Calculator',
        description: 'Estimate the cubic yards of dirt you need',
        icon: 'layers'
    },
    {
        category: 'calculator',
        slug: 'easy-counter',
        title: 'Easy Counter',
        sidebarName: 'Easy Counter',
        description: 'A simple counter with add, subtract and reset',
        icon: 'plus-slash-minus'
    },
    {
        category: 'calculator',
        slug: 'click-counter',
        title: 'Click Counter',
        sidebarName: 'Click Counter',
        description: 'Count clicks and measure clicks per second',
        icon: 'hand-index'
    },
    {
        category: 'calculator',
        slug: 'cap-rate-calculator',
        title: 'Cap Rate Calculator',
        sidebarName: 'Cap Rate Calculator',
        description: 'Calculate the capitalization rate of a property',
        icon: 'house-door'
    },
    {
        category: 'games',
        slug: 'wordle',
        title: 'Wordle',
        sidebarName: 'Wordle',
        description: 'Guess the five-letter word in six tries',
        icon: 'grid-3x3-gap'
    },
    {
        category: 'games',
        slug: 'tic-tac-toe',
        title: 'Tic Tac Toe',
        sidebarName: 'TicTacToe',
        description: 'Play tic-tac-toe against the computer',
        icon: 'x-lg'
    },
    {
        category: 'games',
        slug: 'memory-match',
        title: 'Memory Match',
        sidebarName: 'MemoryMatch',
        description: 'Flip cards to find the matching pairs',
        icon: 'columns-gap'
    },
    {
        category: 'string',
        slug: 'slugify',
        title: 'Slugify String',
        sidebarName: 'Slugify String',
        description: 'Turn any text into a clean URL slug',
        icon: 'link-45deg'
    },
    {
        category: 'string',
        slug: 'regex-tester',
        title: 'Regex Tester',
        sidebarName: 'Regex Tester',
        description: 'Test regular expressions with live matches, groups and replacements',
        icon: 'regex'
    },
    {
        category: 'string',
        slug: 'text-diff',
        title: 'Text Diff',
        sidebarName: 'Text Diff',
        description: 'Compare two texts and see what changed',
        icon: 'file-diff'
    },
    {
        category: 'string',
        slug: 'nato-alphabet',
        title: 'Text to NATO Alphabet',
        sidebarName: 'NATO Alphabet',
        description: 'Spell text with the NATO phonetic alphabet',
        icon: 'broadcast'
    },
    {
        category: 'string',
        slug: 'text-to-unicode',
        title: 'Text to Unicode',
        sidebarName: 'Text to Unicode',
        description: 'Convert text to Unicode code points and back',
        icon: 'emoji-smile'
    },
    {
        category: 'string',
        slug: 'line-tools',
        title: 'Line Tools',
        sidebarName: 'Line Tools',
        description: 'Sort, reverse, de-duplicate and clean up lists of lines',
        icon: 'sort-alpha-down'
    },
    {
        category: 'converter',
        slug: 'yaml-to-json',
        title: 'YAML to JSON',
        sidebarName: 'YAML to JSON',
        description: 'Convert YAML into formatted JSON',
        icon: 'filetype-yml'
    },
    {
        category: 'converter',
        slug: 'json-to-yaml',
        title: 'JSON to YAML',
        sidebarName: 'JSON to YAML',
        description: 'Convert JSON into readable YAML',
        icon: 'filetype-yml'
    },
    {
        category: 'converter',
        slug: 'toml-to-json',
        title: 'TOML to JSON',
        sidebarName: 'TOML to JSON',
        description: 'Convert TOML into formatted JSON',
        icon: 'file-earmark-code'
    },
    {
        category: 'converter',
        slug: 'json-to-toml',
        title: 'JSON to TOML',
        sidebarName: 'JSON to TOML',
        description: 'Convert a JSON object into TOML',
        icon: 'file-earmark-code'
    },
    {
        category: 'converter',
        slug: 'yaml-to-toml',
        title: 'YAML to TOML',
        sidebarName: 'YAML to TOML',
        description: 'Convert YAML into TOML',
        icon: 'file-earmark-code'
    },
    {
        category: 'converter',
        slug: 'toml-to-yaml',
        title: 'TOML to YAML',
        sidebarName: 'TOML to YAML',
        description: 'Convert TOML into YAML',
        icon: 'filetype-yml'
    },
    {
        category: 'converter',
        slug: 'json-to-xml',
        title: 'JSON to XML',
        sidebarName: 'JSON to XML',
        description: 'Convert JSON into XML with attributes and arrays',
        icon: 'filetype-xml'
    },
    {
        category: 'converter',
        slug: 'markdown-to-html',
        title: 'Markdown to HTML',
        sidebarName: 'Markdown to HTML',
        description: 'Convert Markdown to HTML with a live preview',
        icon: 'markdown'
    },
    {
        category: 'converter',
        slug: 'sql-formatter',
        title: 'SQL Formatter',
        sidebarName: 'SQL Formatter',
        description: 'Prettify SQL for MySQL, PostgreSQL, SQLite and more',
        icon: 'database'
    },
    {
        category: 'converter',
        slug: 'json-diff',
        title: 'JSON Diff',
        sidebarName: 'JSON Diff',
        description: 'Compare two JSON documents ignoring key order',
        icon: 'file-diff'
    },
    {
        category: 'converter',
        slug: 'color-converter',
        title: 'Color Converter',
        sidebarName: 'Color Converter',
        description: 'Convert HEX, RGB, HSL and CMYK and check contrast',
        icon: 'palette'
    },
    {
        category: 'converter',
        slug: 'base-converter',
        title: 'Integer Base Converter',
        sidebarName: 'Base Converter',
        description: 'Convert numbers between binary, octal, decimal, hex and more',
        icon: '123'
    },
    {
        category: 'converter',
        slug: 'roman-numeral-converter',
        title: 'Roman Numeral Converter',
        sidebarName: 'Roman Numerals',
        description: 'Convert numbers to Roman numerals and back',
        icon: 'type-bold'
    },
    {
        category: 'converter',
        slug: 'timestamp-converter',
        title: 'Unix Timestamp Converter',
        sidebarName: 'Unix Timestamp',
        description: 'Convert Unix timestamps and dates to every format',
        icon: 'calendar-event'
    },
    {
        category: 'converter',
        slug: 'unit-converter',
        title: 'Unit Converter',
        sidebarName: 'Unit Converter',
        description: 'Convert length, mass, volume, speed, data and temperature',
        icon: 'rulers'
    },
    {
        category: 'security',
        slug: 'jwt-decoder',
        title: 'JWT Decoder',
        sidebarName: 'JWT Decoder',
        description: 'Decode JSON Web Tokens and inspect their claims',
        icon: 'shield-check'
    },
    {
        category: 'security',
        slug: 'hmac-generator',
        title: 'HMAC Generator',
        sidebarName: 'HMAC Generator',
        description: 'Compute HMAC signatures with SHA-1, SHA-256 and more',
        icon: 'key'
    },
    {
        category: 'security',
        slug: 'basic-auth-generator',
        title: 'Basic Auth Generator',
        sidebarName: 'Basic Auth Generator',
        description: 'Generate the HTTP Basic Authorization header',
        icon: 'person-lock'
    },
    {
        category: 'security',
        slug: 'totp-generator',
        title: 'TOTP Generator',
        sidebarName: 'TOTP Generator',
        description: 'Generate time-based one-time passwords for 2FA testing',
        icon: 'stopwatch'
    },
    {
        category: 'security',
        slug: 'bcrypt',
        title: 'Bcrypt Hash Generator',
        sidebarName: 'Bcrypt',
        description: 'Hash and compare passwords with bcrypt',
        icon: 'lock'
    },
    {
        category: 'security',
        slug: 'password-strength',
        title: 'Password Strength Analyser',
        sidebarName: 'Password Strength',
        description: 'Estimate how long a password would resist guessing',
        icon: 'speedometer2'
    },
    {
        category: 'generator',
        slug: 'uuid-generator',
        title: 'UUID & ULID Generator',
        sidebarName: 'UUID & ULID Generator',
        description: 'Generate UUID v4, UUID v7 and ULID identifiers',
        icon: 'hash'
    },
    {
        category: 'generator',
        slug: 'cron-generator',
        title: 'Crontab Generator',
        sidebarName: 'Crontab Generator',
        description: 'Explain cron expressions and preview the next runs',
        icon: 'clock'
    },
    {
        category: 'generator',
        slug: 'svg-placeholder-generator',
        title: 'SVG Placeholder Generator',
        sidebarName: 'SVG Placeholder',
        description: 'Create placeholder images as SVG',
        icon: 'image'
    },
    {
        category: 'generator',
        slug: 'lorem-ipsum-generator',
        title: 'Lorem Ipsum Generator',
        sidebarName: 'Lorem Ipsum',
        description: 'Generate placeholder text',
        icon: 'text-paragraph'
    },
    {
        category: 'calculator',
        slug: 'chmod-calculator',
        title: 'Chmod Calculator',
        sidebarName: 'Chmod Calculator',
        description: 'Calculate Unix file permissions in octal and symbolic form',
        icon: 'terminal'
    },
    {
        category: 'calculator',
        slug: 'percentage-calculator',
        title: 'Percentage Calculator',
        sidebarName: 'Percentage Calculator',
        description: 'Calculate percentages, ratios and percentage change',
        icon: 'percent'
    },
    {
        category: 'calculator',
        slug: 'ipv4-subnet-calculator',
        title: 'IPv4 Subnet Calculator',
        sidebarName: 'IPv4 Subnet Calculator',
        description: 'Calculate network, broadcast and host range from CIDR',
        icon: 'diagram-3'
    },
    {
        category: 'calculator',
        slug: 'chronometer',
        title: 'Chronometer',
        sidebarName: 'Chronometer',
        description: 'A stopwatch with lap times',
        icon: 'stopwatch'
    },
    {
        category: 'testing',
        slug: 'http-status-codes',
        title: 'HTTP Status Codes',
        sidebarName: 'HTTP Status Codes',
        description: 'Searchable reference of HTTP status codes',
        icon: 'hdd-network'
    },
    {
        category: 'testing',
        slug: 'mime-types',
        title: 'MIME Types',
        sidebarName: 'MIME Types',
        description: 'Look up MIME types for file extensions',
        icon: 'file-earmark'
    },
    {
        category: 'testing',
        slug: 'url-parser',
        title: 'URL Parser',
        sidebarName: 'URL Parser',
        description: 'Break a URL into parts and query parameters',
        icon: 'globe'
    },
    {
        category: 'testing',
        slug: 'telegram',
        title: 'Telegram Bot Tester',
        sidebarName: 'Telegram',
        description: 'Test your Telegram bot with messages, photos and documents',
        icon: 'chat-dots',
        features: ['Messages', 'Photos', 'Documents', 'cURL Export']
    }
].map((tool) => ({ ...tool, path: `/${tool.category}/${tool.slug}` }));

export const toolsIn = (categoryId) => tools.filter((tool) => tool.category === categoryId);
