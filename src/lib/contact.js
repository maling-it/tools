import { REPO_URL } from './site.js';

// Each type maps to an issue form in .github/ISSUE_TEMPLATE; the labels come from the form itself.
export const ISSUE_TYPES = {
    bug: { label: 'Bug report', template: 'bug_report.yml', prefix: 'Bug' },
    tool: { label: 'Tool request', template: 'tool_request.yml', prefix: 'Tool request' },
    feedback: { label: 'Feedback or question', template: 'feedback.yml', prefix: 'Feedback' }
};

// Builds a link that opens the matching GitHub issue form with its fields already filled in.
export const buildIssueUrl = ({ type = 'feedback', tool = '', title = '', message = '', page = '', userAgent = '' } = {}) => {
    const meta = ISSUE_TYPES[type];
    if (!meta) throw new Error(`Unknown issue type "${type}".`);
    if (!title.trim() && !message.trim()) throw new Error('Write a title or a message first.');

    const summary = title.trim() || message.trim().split('\n')[0].slice(0, 60);
    const params = new URLSearchParams({ template: meta.template, title: `${meta.prefix}: ${summary}`, description: message.trim() });
    // Field ids shared by the forms; fields a form does not have are ignored by GitHub.
    if (tool) params.set('tool', tool);
    if (page) params.set('page', page);
    if (userAgent) params.set('browser', userAgent);
    return `${REPO_URL}/issues/new?${params}`;
};
