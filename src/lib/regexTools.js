// Work that runs user-supplied regular expressions. In the browser it runs inside a Web Worker (see safeRegex.js),
// so a pattern with catastrophic backtracking can be stopped; these functions are plain and also work in Node.
import { planRename, runBulk } from './bulk.js';
import { regexMatches } from './regexMatches.js';
import { replaceText } from './textUtils.js';

export { regexMatches };

/** Find and replace in several documents. Returns `{ name, out, count }` for each. */
export const replaceInDocuments = (docs, find, replacement, options = {}) =>
    docs.map(({ name, text }) => {
        const { text: out, count } = replaceText(text, find, replacement, options);
        return { name, out, count };
    });

const handlers = {
    matches: regexMatches,
    replace: ({ text, find, replacement, options }) => replaceText(text, find, replacement, options),
    replaceDocuments: ({ docs, find, replacement, options }) => replaceInDocuments(docs, find, replacement, options),
    bulkLines: ({ text, operation, options }) => runBulk(text, operation, options),
    renamePlan: ({ names, rules }) => planRename(names, rules)
};

export const REGEX_JOB_TYPES = Object.keys(handlers);

/** Runs one job (`{ type, ...parameters }`) and returns its result; throws for an unknown type or an invalid pattern. */
export const handleRegexJob = async ({ type, ...parameters }) => {
    const handler = handlers[type];
    if (!handler) throw new Error(`Unknown regex job "${type}".`);
    return handler(parameters);
};
