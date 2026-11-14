import { Worker } from 'node:worker_threads';

/**
 * Runs tool calls one at a time in a worker thread, with a time limit.
 * When a call takes too long the worker is terminated and replaced, so the server keeps answering.
 */
export const createRunner = ({ timeoutMs = 15_000 } = {}) => {
    const queue = [];
    let worker = null;
    let current = null;
    let nextId = 0;

    const finish = (job, result) => {
        clearTimeout(job.timer);
        if (current === job) current = null;
        job.resolve(result);
        pump();
    };

    const restart = () => {
        worker?.terminate();
        worker = null;
    };

    const start = () => {
        worker = new Worker(new URL('./worker.js', import.meta.url));
        worker.unref(); // an idle worker must not keep the server process alive
        worker.on('message', ({ id, ...result }) => {
            if (current?.id === id) finish(current, result);
        });
        worker.on('error', (error) => {
            const job = current;
            restart();
            if (job) finish(job, { ok: false, error: `The tool crashed: ${error.message}` });
            else pump();
        });
        return worker;
    };

    function pump() {
        if (current || queue.length === 0) return;
        current = queue.shift();
        const job = current;
        job.timer = setTimeout(() => {
            restart();
            finish(job, { ok: false, error: `The tool took longer than ${Math.round(timeoutMs / 1000)} seconds and was stopped. The input may be too large, or a pattern too complex (for example a regular expression with nested repeats).` });
        }, timeoutMs);
        (worker ?? start()).postMessage({ id: job.id, name: job.name, args: job.args });
    }

    return {
        /** Resolves to `{ ok: true, text }` or `{ ok: false, error }`; it never rejects. */
        run: (name, args) =>
            new Promise((resolve) => {
                queue.push({ id: nextId++, name, args, resolve });
                pump();
            }),
        /** Starts the worker ahead of the first call. */
        warmUp: () => void (worker ?? start()),
        close: () => {
            for (const job of queue.splice(0)) job.resolve({ ok: false, error: 'The server is shutting down.' });
            restart();
        }
    };
};
