// Kept in its own small module so a page can import it without the rest of the regex job code.

/** Every match of `pattern` in `text` with its capture groups, and optionally the text with `replacement` applied. */
export const regexMatches = ({ pattern, flags = 'g', text, replacement = '', limit = 500 }) => {
    if (pattern === '') return { matches: [], replaced: '' };
    const regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
    const matches = [...text.matchAll(regex)].slice(0, limit).map((m) => ({ text: m[0], index: m.index, groups: m.slice(1), named: m.groups ?? null }));
    const replaced = replacement !== '' ? text.replace(new RegExp(pattern, flags), replacement) : '';
    return { matches, replaced };
};
