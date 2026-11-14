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
