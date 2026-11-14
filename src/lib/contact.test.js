import { describe, expect, it } from 'vitest';
import { buildIssueUrl } from './contact.js';

describe('buildIssueUrl', () => {
    it('opens the matching issue form with its fields prefilled', () => {
        const url = new URL(buildIssueUrl({ type: 'bug', tool: 'JSON Formatter', title: 'Crashes on empty input', message: 'Steps:\n1. open', page: 'https://x.dev/p/', userAgent: 'UA' }));
        expect(url.origin + url.pathname).toBe('https://github.com/maling-it/tools/issues/new');
        expect(url.searchParams.get('template')).toBe('bug_report.yml');
        expect(url.searchParams.get('title')).toBe('Bug: Crashes on empty input');
        expect(url.searchParams.get('description')).toBe('Steps:\n1. open');
        expect(url.searchParams.get('tool')).toBe('JSON Formatter');
        expect(url.searchParams.get('page')).toBe('https://x.dev/p/');
        expect(url.searchParams.get('browser')).toBe('UA');
    });

    it('derives a title from the message and omits empty fields', () => {
        const url = new URL(buildIssueUrl({ type: 'tool', message: 'Please add a CSS minifier\nit would help' }));
        expect(url.searchParams.get('template')).toBe('tool_request.yml');
        expect(url.searchParams.get('title')).toBe('Tool request: Please add a CSS minifier');
        expect(url.searchParams.has('page')).toBe(false);
        expect(url.searchParams.has('tool')).toBe(false);
    });

    it('rejects empty and unknown requests', () => {
        expect(() => buildIssueUrl({ type: 'bug' })).toThrow('Write a title');
        expect(() => buildIssueUrl({ type: 'nope', message: 'x' })).toThrow('Unknown issue type');
    });
});
