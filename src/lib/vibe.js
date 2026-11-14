// Helpers for AI-assisted ("vibe") coding: rules files, prompts, context packing and more

// Tokens
// A rough estimate (within ~20% for English and code); real tokenizers differ per model.
export const estimateTokens = (text) => {
    const characters = text.length;
    const words = (text.match(/\S+/g) ?? []).length;
    const tokens = text === '' ? 0 : Math.ceil((characters / 4 + words / 0.75) / 2);
    return { tokens, characters, words, lines: text === '' ? 0 : text.split(/\r?\n/).length };
};

export const estimateCost = (tokens, pricePerMillion) => (tokens / 1_000_000) * Number(pricePerMillion || 0);

// Rules files for coding agents
export const RULE_FORMATS = {
    agents: { label: 'AGENTS.md', filename: 'AGENTS.md', note: 'Open format read by Codex, Cursor, Copilot, Jules, Aider and others.' },
    claude: { label: 'CLAUDE.md', filename: 'CLAUDE.md', note: 'Project memory file for Claude Code.' },
    cursor: { label: 'Cursor rule (.mdc)', filename: '.cursor/rules/project.mdc', note: 'Always-on project rule for Cursor.' },
    copilot: { label: 'GitHub Copilot', filename: '.github/copilot-instructions.md', note: 'Repository-wide Copilot instructions.' },
    windsurf: { label: 'Windsurf rules', filename: '.windsurfrules', note: 'Workspace rules for Windsurf.' }
};

const lines = (text) => text.split(/\r?\n/).map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
const bullets = (items) => items.map((item) => `- ${item}`).join('\n');

export const buildRulesFile = ({ format = 'agents', project = '', description = '', stack = '', commands = {}, structure = '', conventions = '', dos = '', donts = '' } = {}) => {
    const meta = RULE_FORMATS[format];
    if (!meta) throw new Error(`Unknown format "${format}".`);

    const sections = [];
    sections.push(`# ${project.trim() || 'Project'}`);
    if (description.trim()) sections.push(description.trim());
    if (lines(stack).length) sections.push(`## Tech stack\n\n${bullets(lines(stack))}`);

    const commandLines = [['Install', commands.install], ['Dev server', commands.dev], ['Test', commands.test], ['Lint', commands.lint], ['Build', commands.build]].filter(([, cmd]) => cmd?.trim());
    if (commandLines.length) {
        sections.push(`## Commands\n\n\`\`\`bash\n${commandLines.map(([label, cmd]) => `${cmd.trim().padEnd(28)} # ${label}`).join('\n')}\n\`\`\``);
    }
    if (structure.trim()) sections.push(`## Project structure\n\n\`\`\`\n${structure.trim()}\n\`\`\``);
    if (lines(conventions).length) sections.push(`## Conventions\n\n${bullets(lines(conventions))}`);
    if (lines(dos).length) sections.push(`## Always\n\n${bullets(lines(dos))}`);
    if (lines(donts).length) sections.push(`## Never\n\n${bullets(lines(donts))}`);

    const body = sections.join('\n\n') + '\n';
    if (format === 'cursor') {
        const summary = (description.trim() || project.trim() || 'Project rules').split('\n')[0].replace(/"/g, "'");
        return { filename: meta.filename, content: `---\ndescription: "${summary}"\nglobs:\nalwaysApply: true\n---\n\n${body}` };
    }
    return { filename: meta.filename, content: body };
};

// Prompt building
export const PROMPT_STYLES = { markdown: 'Markdown headings', xml: 'XML tags', plain: 'Plain text' };

export const buildPrompt = ({ role = '', context = '', task = '', constraints = '', outputFormat = '', examples = '', style = 'markdown' } = {}) => {
    const parts = [
        ['Role', role],
        ['Context', context],
        ['Task', task],
        ['Constraints', lines(constraints).length ? bullets(lines(constraints)) : ''],
        ['Output format', outputFormat],
        ['Examples', examples]
    ].filter(([, value]) => value.trim());
    if (parts.length === 0) throw new Error('Fill in at least one section.');

    return parts
        .map(([name, value]) => {
            const text = value.trim();
            if (style === 'xml') return `<${name.toLowerCase().replace(' ', '_')}>\n${text}\n</${name.toLowerCase().replace(' ', '_')}>`;
            if (style === 'plain') return `${name}: ${text}`;
            return `## ${name}\n\n${text}`;
        })
        .join('\n\n');
};

export const extractVariables = (template) => [...new Set([...template.matchAll(/\{\{\s*([\w.-]+)\s*\}\}/g)].map((m) => m[1]))];

export const fillTemplate = (template, values) =>
    template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, name) => (values[name]?.trim() ? values[name] : match));

// Packing files into one prompt-friendly document
const IGNORED_DIRS = /(^|\/)(node_modules|\.git|\.svelte-kit|\.next|\.nuxt|dist|build|out|coverage|\.cache|__pycache__|\.venv|venv|target|vendor)(\/|$)/;
// Secrets are never packed: env files and private keys.
const SECRET_FILES = /(^|\/)(\.env(\..*)?|id_(rsa|ed25519|ecdsa|dsa)|.*\.(pem|key|p12|pfx|keystore))$/i;
const IGNORED_FILES = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|Cargo\.lock|poetry\.lock|composer\.lock|\.DS_Store)$/;
const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|bmp|tiff?|heic|pdf|zip|gz|tar|7z|rar|bz2|woff2?|ttf|otf|eot|mp[34]|wav|ogg|flac|webm|mov|avi|mkv|exe|dll|so|dylib|bin|wasm|class|jar|o|a|pyc|sqlite|db)$/i;

export const shouldIgnorePath = (path) => SECRET_FILES.test(path) || IGNORED_DIRS.test(path) || IGNORED_FILES.test(path) || BINARY_EXT.test(path);

export const buildTree = (paths) => {
    const root = {};
    for (const path of [...paths].sort()) {
        let node = root;
        for (const part of path.split('/')) node = node[part] ??= {};
    }
    const render = (node, prefix = '') =>
        Object.entries(node).flatMap(([name, child], index, all) => {
            const last = index === all.length - 1;
            return [`${prefix}${last ? '└── ' : '├── '}${name}`, ...render(child, prefix + (last ? '    ' : '│   '))];
        });
    return render(root).join('\n');
};

const LANGUAGES = { js: 'js', mjs: 'js', cjs: 'js', ts: 'ts', tsx: 'tsx', jsx: 'jsx', svelte: 'svelte', vue: 'vue', py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java', kt: 'kotlin', php: 'php', cs: 'csharp', c: 'c', cpp: 'cpp', h: 'c', css: 'css', scss: 'scss', html: 'html', json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml', md: 'markdown', sh: 'bash', sql: 'sql', xml: 'xml' };

export const packFiles = (files, { format = 'markdown', includeTree = true } = {}) => {
    if (files.length === 0) throw new Error('Add at least one file.');
    const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));
    const tree = includeTree ? buildTree(sorted.map((f) => f.path)) : '';

    if (format === 'xml') {
        const body = sorted.map((f) => `<file path="${f.path.replace(/"/g, '&quot;')}">\n${f.content}\n</file>`).join('\n\n');
        return `${tree ? `<directory_structure>\n${tree}\n</directory_structure>\n\n` : ''}<files>\n${body}\n</files>\n`;
    }
    const body = sorted
        .map((f) => {
            const ext = f.path.split('.').pop().toLowerCase();
            // A longer fence keeps files that contain ``` intact.
            const fence = '`'.repeat(Math.max(3, ...[...f.content.matchAll(/`{3,}/g)].map((m) => m[0].length + 1)));
            return `## ${f.path}\n\n${fence}${LANGUAGES[ext] ?? ''}\n${f.content}\n${fence}`;
        })
        .join('\n\n');
    return `${tree ? `# Directory structure\n\n\`\`\`\n${tree}\n\`\`\`\n\n` : ''}# Files\n\n${body}\n`;
};

// DESIGN.md: a visual identity description for coding agents
export const buildDesignMd = ({ name = '', description = '', colors = [], headingFont = '', bodyFont = '', radius = '', spacing = '', tone = '', components = '', dos = '', donts = '' } = {}) => {
    const sections = [`# Design system: ${name.trim() || 'Project'}`];
    if (description.trim()) sections.push(description.trim());
    const palette = colors.filter((c) => c.hex?.trim());
    if (palette.length) {
        sections.push(`## Colors\n\n| Role | Hex |\n| --- | --- |\n${palette.map((c) => `| ${c.name?.trim() || 'Color'} | \`${c.hex.trim()}\` |`).join('\n')}`);
    }
    const type = [headingFont.trim() && `Headings: ${headingFont.trim()}`, bodyFont.trim() && `Body: ${bodyFont.trim()}`].filter(Boolean);
    if (type.length) sections.push(`## Typography\n\n${bullets(type)}`);
    const layout = [radius.trim() && `Corner radius: ${radius.trim()}`, spacing.trim() && `Spacing scale: ${spacing.trim()}`].filter(Boolean);
    if (layout.length) sections.push(`## Shape and spacing\n\n${bullets(layout)}`);
    if (tone.trim()) sections.push(`## Tone and feel\n\n${tone.trim()}`);
    if (components.trim()) sections.push(`## Components\n\n${components.trim()}`);
    if (lines(dos).length) sections.push(`## Do\n\n${bullets(lines(dos))}`);
    if (lines(donts).length) sections.push(`## Don't\n\n${bullets(lines(donts))}`);
    return sections.join('\n\n') + '\n';
};

// Conventional commits
export const COMMIT_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

export const buildCommitMessage = ({ type = 'feat', scope = '', description = '', body = '', breaking = false, breakingNote = '', issues = '' } = {}) => {
    if (!COMMIT_TYPES.includes(type)) throw new Error(`Unknown type "${type}".`);
    if (!description.trim()) throw new Error('A short description is required.');
    const subject = `${type}${scope.trim() ? `(${scope.trim()})` : ''}${breaking ? '!' : ''}: ${description.trim().replace(/\.$/, '')}`;
    const footer = [
        breaking && `BREAKING CHANGE: ${breakingNote.trim() || description.trim()}`,
        ...issues.split(/[\s,]+/).filter(Boolean).map((issue) => `Closes ${issue.startsWith('#') ? issue : `#${issue}`}`)
    ].filter(Boolean);
    return [subject, body.trim(), footer.join('\n')].filter(Boolean).join('\n\n');
};

// llms.txt
export const buildLlmsTxt = ({ title = '', summary = '', details = '', sections = '' } = {}) => {
    if (!title.trim()) throw new Error('A site name is required.');
    const out = [`# ${title.trim()}`];
    if (summary.trim()) out.push(`> ${summary.trim()}`);
    if (details.trim()) out.push(details.trim());

    // Input lines: "## Section" starts a section, "Title | https://url | optional note" adds a link.
    let open = false;
    for (const raw of sections.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line) continue;
        if (line.startsWith('#')) {
            out.push(`## ${line.replace(/^#+\s*/, '')}`);
            open = true;
            continue;
        }
        const [linkTitle, url, note] = line.split('|').map((part) => part.trim());
        if (!url) throw new Error(`"${line}" needs a URL: Title | https://example.com | note`);
        if (!open) {
            out.push('## Links');
            open = true;
        }
        out.push(`- [${linkTitle}](${url})${note ? `: ${note}` : ''}`);
    }
    // Blank line between blocks, but link lists stay tight.
    return out.reduce((text, line, i) => text + (i === 0 ? '' : line.startsWith('- ') && out[i - 1].startsWith('- ') ? '\n' : '\n\n') + line, '') + '\n';
};

// MCP client configuration
export const MCP_CLIENTS = {
    'claude-desktop': { label: 'Claude Desktop', path: 'claude_desktop_config.json' },
    cursor: { label: 'Cursor', path: '.cursor/mcp.json' },
    vscode: { label: 'VS Code', path: '.vscode/mcp.json' },
    'claude-code': { label: 'Claude Code (CLI)', path: 'terminal' }
};

const quoteShell = (value) => (/^[\w@%+=:,./-]+$/.test(value) ? value : `'${value.replace(/'/g, `'\\''`)}'`);

export const buildMcpConfig = ({ client = 'claude-desktop', name = 'my-server', command = '', args = '', env = '' } = {}) => {
    if (!MCP_CLIENTS[client]) throw new Error(`Unknown client "${client}".`);
    if (!command.trim()) throw new Error('A command is required, e.g. npx or node.');
    const key = name.trim().replace(/\s+/g, '-') || 'my-server';
    const argList = args.split(/\r?\n/).map((a) => a.trim()).filter(Boolean);
    const envPairs = env.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
        const i = l.indexOf('=');
        if (i < 1) throw new Error(`"${l}" must look like NAME=value.`);
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    });
    const envObject = Object.fromEntries(envPairs);

    if (client === 'claude-code') {
        const envFlags = envPairs.map(([k, v]) => `-e ${quoteShell(`${k}=${v}`)}`).join(' ');
        return `claude mcp add ${key}${envFlags ? ` ${envFlags}` : ''} -- ${[command.trim(), ...argList].map(quoteShell).join(' ')}`;
    }
    const server = { command: command.trim(), args: argList, ...(envPairs.length ? { env: envObject } : {}) };
    if (client === 'vscode') return JSON.stringify({ servers: { [key]: { type: 'stdio', ...server } } }, null, 2);
    return JSON.stringify({ mcpServers: { [key]: server } }, null, 2);
};
