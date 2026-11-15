// Runs regular expression jobs in a Web Worker with a time limit, so a pattern with catastrophic backtracking
// (for example `(a+)+$`) cannot freeze the page. When the limit is hit the worker is terminated.

export const REGEX_TIMEOUT_MESSAGE = 'This pattern took too long and was stopped. It may contain nested repeats, for example (a+)+.';

export class RegexTimeoutError extends Error {
    constructor(message = REGEX_TIMEOUT_MESSAGE) {
        super(message);
        this.name = 'RegexTimeoutError';
    }
}

/** A newer job replaced this one before it finished. Callers should ignore it. */
export class RegexSupersededError extends Error {
    constructor() {
        super('Superseded by a newer regex job.');
        this.name = 'RegexSupersededError';
    }
}

export const isRegexTimeout = (error) => error instanceof RegexTimeoutError;
export const isRegexSuperseded = (error) => error instanceof RegexSupersededError;

const browserWorker = () => new Worker(new URL('./regexWorker.js', import.meta.url), { type: 'module' });

/**
 * One runner per tool. `run(job)` resolves with the job's result and rejects with a `RegexTimeoutError` after
 * `timeoutMs`, with a `RegexSupersededError` when a newer `run` replaced it, or with the error of the job itself
 * (for example an invalid pattern). Starting a new job stops the running one, which suits live-as-you-type tools.
 */
export const createRegexRunner = ({ timeoutMs = 2000, workerFactory = browserWorker } = {}) => {
    let worker = null;
    let current = null;
    let nextId = 0;

    const stop = () => {
        worker?.terminate();
        worker = null;
    };

    const settle = (job, action) => {
        clearTimeout(job.timer);
        if (current === job) current = null;
        action();
    };

    return {
        run(job, { timeout = timeoutMs } = {}) {
            return new Promise((resolve, reject) => {
                if (current) {
                    const stale = current;
                    settle(stale, () => stale.reject(new RegexSupersededError()));
                    stop(); // the stale job may still be spinning, so replace the whole worker
                }

                const entry = { id: nextId++, resolve, reject, timer: 0 };
                current = entry;
                entry.timer = setTimeout(() => {
                    stop();
                    settle(entry, () => reject(new RegexTimeoutError()));
                }, timeout);

                try {
                    worker ??= workerFactory();
                } catch (error) {
                    settle(entry, () => reject(new Error(`The regex worker could not start: ${error.message}`)));
                    return;
                }
                worker.onmessage = ({ data }) => {
                    if (current !== entry || data.id !== entry.id) return;
                    settle(entry, () => ('error' in data ? reject(new Error(data.error)) : resolve(data.result)));
                };
                worker.onerror = (event) => {
                    if (current !== entry) return;
                    stop();
                    settle(entry, () => reject(new Error(event?.message || 'The regex worker failed.')));
                };
                worker.postMessage({ id: entry.id, ...job });
            });
        },
        /** Stops any running job and releases the worker. Call it when the page goes away. */
        close() {
            if (current) {
                const job = current;
                settle(job, () => job.reject(new RegexSupersededError()));
            }
            stop();
        }
    };
};
