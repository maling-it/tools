// Search and recent-history helpers for the tool directory

const normalize = (text) => text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

// Higher is better; 0 means no match. Every word of the query must match somewhere.
export const scoreTool = (tool, query) => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return 1;
    const title = normalize(`${tool.title} ${tool.sidebarName ?? ''}`);
    const description = normalize(tool.description ?? '');
    const category = normalize(tool.category ?? '');
    const features = normalize((tool.features ?? []).join(' '));

    let score = 0;
    for (const word of words) {
        let wordScore = 0;
        if (title.startsWith(word)) wordScore = 100;
        else if (title.split(/[\s/&|-]+/).some((part) => part.startsWith(word))) wordScore = 80;
        else if (title.includes(word)) wordScore = 60;
        else if (category.includes(word)) wordScore = 30;
        else if (features.includes(word)) wordScore = 25;
        else if (description.includes(word)) wordScore = 20;
        if (wordScore === 0) return 0;
        score += wordScore;
    }
    return score;
};

export const searchTools = (tools, query, limit = 50) =>
    tools
        .map((tool) => ({ tool, score: scoreTool(tool, query) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title))
        .slice(0, limit)
        .map((entry) => entry.tool);

const RECENT_KEY = 'mools-recent';

export const getRecent = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
        return Array.isArray(stored) ? stored.filter((p) => typeof p === 'string') : [];
    } catch {
        return [];
    }
};

export const addRecent = (path, max = 6) => {
    try {
        const next = [path, ...getRecent().filter((p) => p !== path)].slice(0, max);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        return next;
    } catch {
        return [];
    }
};

// Tools from the same category, starting after the current one so every page links somewhere different.
export const relatedTools = (tools, current, count = 3) => {
    const same = tools.filter((t) => t.category === current.category);
    const index = same.findIndex((t) => t.slug === current.slug);
    return Array.from({ length: Math.min(count, same.length - 1) }, (_, i) => same[(index + 1 + i) % same.length]);
};
