import { describe, expect, it } from 'vitest';
import { buildCommitMessage, buildDesignMd, buildLlmsTxt, buildMcpConfig, buildPrompt, buildRulesFile, buildTree, estimateCost, estimateTokens, extractVariables, fillTemplate, packFiles, shouldIgnorePath } from './vibe.js';
import { PROMPTS, PROMPT_CATEGORIES } from './prompts.js';

describe('tokens', () => {
    it('estimates tokens', () => {
        expect(estimateTokens('')).toEqual({ tokens: 0, characters: 0, words: 0, lines: 0 });
        const result = estimateTokens('Hello world, this is a test.');
        expect(result.words).toBe(6);
        expect(result.tokens).toBeGreaterThan(4);
        expect(result.tokens).toBeLessThan(12);
        expect(estimateCost(2_000_000, 3)).toBe(6);
    });
});

describe('rules files', () => {
    const input = { project: 'Mools', description: 'Dev tools.', stack: '- SvelteKit\n- Bootstrap', commands: { test: 'bun run test', dev: 'bun run dev' }, conventions: 'Use tabs', donts: 'Commit secrets' };

    it('builds AGENTS.md with all sections', () => {
        const { filename, content } = buildRulesFile({ ...input, format: 'agents' });
        expect(filename).toBe('AGENTS.md');
        expect(content).toContain('# Mools');
        expect(content).toContain('- SvelteKit');
        expect(content).toContain('bun run test');
        expect(content).toContain('## Never\n\n- Commit secrets');
    });

    it('adds frontmatter for cursor rules', () => {
        const { filename, content } = buildRulesFile({ ...input, format: 'cursor' });
        expect(filename).toBe('.cursor/rules/project.mdc');
        expect(content.startsWith('---\ndescription: "Dev tools."')).toBe(true);
        expect(content).toContain('alwaysApply: true');
    });

    it('rejects unknown formats', () => {
        expect(() => buildRulesFile({ format: 'nope' })).toThrow();
    });
});

describe('prompts', () => {
    it('builds prompts in three styles', () => {
        const input = { role: 'Senior dev', task: 'Fix the bug', constraints: '- no new deps\nkeep it small' };
        expect(buildPrompt(input)).toContain('## Constraints\n\n- no new deps\n- keep it small');
        expect(buildPrompt({ ...input, style: 'xml' })).toContain('<task>\nFix the bug\n</task>');
        expect(buildPrompt({ ...input, style: 'plain' })).toContain('Role: Senior dev');
        expect(() => buildPrompt({})).toThrow();
    });

    it('extracts and fills variables', () => {
        expect(extractVariables('Fix {{bug}} in {{ file }} and {{bug}}')).toEqual(['bug', 'file']);
        expect(fillTemplate('Fix {{bug}} in {{file}}', { bug: 'crash', file: '' })).toBe('Fix crash in {{file}}');
    });

    it('ships a valid library', () => {
        expect(PROMPTS.length).toBeGreaterThanOrEqual(20);
        expect(new Set(PROMPTS.map((p) => p.id)).size).toBe(PROMPTS.length);
        for (const p of PROMPTS) expect(PROMPT_CATEGORIES).toContain(p.category);
    });
});

describe('packing', () => {
    it('ignores noise paths', () => {
        expect(shouldIgnorePath('node_modules/x/index.js')).toBe(true);
        expect(shouldIgnorePath('src/logo.png')).toBe(true);
        expect(shouldIgnorePath('bun.lock')).toBe(true);
        expect(shouldIgnorePath('package-lock.json')).toBe(true);
        expect(shouldIgnorePath('src/app.js')).toBe(false);
        expect(shouldIgnorePath('.env')).toBe(true);
        expect(shouldIgnorePath('config/.env.production')).toBe(true);
        expect(shouldIgnorePath('certs/server.pem')).toBe(true);
        expect(shouldIgnorePath('src/environment.js')).toBe(false);
    });

    it('draws a tree', () => {
        expect(buildTree(['a/b.js', 'a/c/d.js', 'e.md'])).toBe('├── a\n│   ├── b.js\n│   └── c\n│       └── d.js\n└── e.md');
    });

    it('packs markdown with safe fences and xml', () => {
        const files = [{ path: 'src/a.js', content: 'const a = 1;' }, { path: 'README.md', content: '```js\nx\n```' }];
        const md = packFiles(files);
        expect(md).toContain('## src/a.js\n\n```js\nconst a = 1;\n```');
        expect(md).toContain('````markdown\n```js');
        const xml = packFiles(files, { format: 'xml', includeTree: false });
        expect(xml).toContain('<file path="src/a.js">\nconst a = 1;\n</file>');
        expect(xml).not.toContain('directory_structure');
        expect(() => packFiles([])).toThrow();
    });
});

describe('design.md, commits, llms.txt, mcp', () => {
    it('builds DESIGN.md', () => {
        const md = buildDesignMd({ name: 'Mools', colors: [{ name: 'Primary', hex: '#0d6efd' }, { name: 'Empty', hex: '' }], headingFont: 'Inter', radius: '8px', donts: 'Use more than two fonts' });
        expect(md).toContain('| Primary | `#0d6efd` |');
        expect(md).not.toContain('Empty');
        expect(md).toContain('Headings: Inter');
        expect(md).toContain("## Don't\n\n- Use more than two fonts");
    });

    it('builds conventional commits', () => {
        expect(buildCommitMessage({ type: 'fix', scope: 'api', description: 'handle null user.' })).toBe('fix(api): handle null user');
        expect(buildCommitMessage({ type: 'feat', description: 'drop v1', breaking: true, breakingNote: 'v1 removed', issues: '12, #15', body: 'Why.' })).toBe('feat!: drop v1\n\nWhy.\n\nBREAKING CHANGE: v1 removed\nCloses #12\nCloses #15');
        expect(() => buildCommitMessage({ type: 'nope', description: 'x' })).toThrow();
        expect(() => buildCommitMessage({ description: '' })).toThrow();
    });

    it('builds llms.txt', () => {
        const text = buildLlmsTxt({ title: 'Mools', summary: 'Tools.', sections: '## Docs\nGuide | https://x.dev/g | the guide\nAPI | https://x.dev/a' });
        expect(text).toBe('# Mools\n\n> Tools.\n\n## Docs\n\n- [Guide](https://x.dev/g): the guide\n- [API](https://x.dev/a)\n');
        expect(buildLlmsTxt({ title: 'T', sections: 'A | https://a.dev' })).toContain('## Links');
        expect(() => buildLlmsTxt({ title: 'T', sections: 'no url' })).toThrow();
        expect(() => buildLlmsTxt({})).toThrow();
    });

    it('builds mcp configs for each client', () => {
        const base = { name: 'mools', command: 'node', args: '/p/server.js', env: 'KEY=a=b' };
        expect(JSON.parse(buildMcpConfig({ ...base, client: 'claude-desktop' }))).toEqual({ mcpServers: { mools: { command: 'node', args: ['/p/server.js'], env: { KEY: 'a=b' } } } });
        expect(JSON.parse(buildMcpConfig({ ...base, client: 'vscode' })).servers.mools.type).toBe('stdio');
        expect(buildMcpConfig({ ...base, client: 'claude-code' })).toBe('claude mcp add mools -e KEY=a=b -- node /p/server.js');
        expect(() => buildMcpConfig({ client: 'cursor' })).toThrow('command');
        expect(() => buildMcpConfig({ command: 'x', env: 'bad' })).toThrow('NAME=value');
    });
});
