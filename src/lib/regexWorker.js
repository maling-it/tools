// Web Worker entry: runs a regex job off the main thread. See safeRegex.js.
import { handleRegexJob } from './regexTools.js';

self.onmessage = async ({ data: { id, ...job } }) => {
    try {
        self.postMessage({ id, result: await handleRegexJob(job) });
    } catch (error) {
        self.postMessage({ id, error: error?.message ?? String(error) });
    }
};
