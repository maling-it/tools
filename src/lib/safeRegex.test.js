import { afterEach, describe, expect, it, vi } from 'vitest';
import { REGEX_TIMEOUT_MESSAGE, RegexSupersededError, RegexTimeoutError, createRegexRunner, isRegexSuperseded, isRegexTimeout } from './safeRegex.js';

// A stand-in for a Web Worker: the test decides when and how it answers.
const fakeWorkers = () => {
    const workers = [];
    const factory = () => {
        const worker = { messages: [], terminated: false, onmessage: null, onerror: null, postMessage(m) { this.messages.push(m); }, terminate() { this.terminated = true; } };
        workers.push(worker);
        return worker;
    };
    return { workers, factory };
};

afterEach(() => vi.useRealTimers());

describe('createRegexRunner', () => {
    it('resolves with the result of the job', async () => {
        const { workers, factory } = fakeWorkers();
        const runner = createRegexRunner({ workerFactory: factory });
        const promise = runner.run({ type: 'matches', pattern: 'a', text: 'a' });
        const [worker] = workers;
        expect(worker.messages[0]).toMatchObject({ type: 'matches', pattern: 'a' });
        worker.onmessage({ data: { id: worker.messages[0].id, result: { matches: [1] } } });
        await expect(promise).resolves.toEqual({ matches: [1] });
        expect(worker.terminated).toBe(false);
    });

    it('rejects with the error of the job', async () => {
        const { workers, factory } = fakeWorkers();
        const runner = createRegexRunner({ workerFactory: factory });
        const promise = runner.run({ type: 'replace' });
        workers[0].onmessage({ data: { id: workers[0].messages[0].id, error: 'Invalid regular expression: /(/: Unterminated group' } });
        await expect(promise).rejects.toThrow('Unterminated group');
    });

    it('stops a job that takes too long and starts a fresh worker for the next one', async () => {
        vi.useFakeTimers();
        const { workers, factory } = fakeWorkers();
        const runner = createRegexRunner({ timeoutMs: 2000, workerFactory: factory });
        const slow = runner.run({ type: 'matches' });
        const caught = slow.catch((e) => e);
        await vi.advanceTimersByTimeAsync(2001);
        const error = await caught;
        expect(isRegexTimeout(error)).toBe(true);
        expect(error).toBeInstanceOf(RegexTimeoutError);
        expect(error.message).toBe(REGEX_TIMEOUT_MESSAGE);
        expect(workers[0].terminated).toBe(true);

        const next = runner.run({ type: 'matches' });
        expect(workers).toHaveLength(2);
        workers[1].onmessage({ data: { id: workers[1].messages[0].id, result: 'ok' } });
        await expect(next).resolves.toBe('ok');
    });

    it('does not time out a job that finishes in time', async () => {
        vi.useFakeTimers();
        const { workers, factory } = fakeWorkers();
        const runner = createRegexRunner({ timeoutMs: 2000, workerFactory: factory });
        const promise = runner.run({ type: 'matches' });
        await vi.advanceTimersByTimeAsync(1500);
        workers[0].onmessage({ data: { id: workers[0].messages[0].id, result: 1 } });
        await vi.advanceTimersByTimeAsync(5000);
        await expect(promise).resolves.toBe(1);
        expect(workers[0].terminated).toBe(false);
    });

    it('supersedes a running job when a new one starts', async () => {
        const { workers, factory } = fakeWorkers();
        const runner = createRegexRunner({ workerFactory: factory });
        const first = runner.run({ type: 'matches', pattern: 'a' }).catch((e) => e);
        const second = runner.run({ type: 'matches', pattern: 'b' });
        expect(isRegexSuperseded(await first)).toBe(true);
        expect(await first).toBeInstanceOf(RegexSupersededError);
        expect(workers[0].terminated).toBe(true);
        workers[1].onmessage({ data: { id: workers[1].messages[0].id, result: 'second' } });
        await expect(second).resolves.toBe('second');
    });

    it('ignores answers for jobs that are no longer current', async () => {
        const { workers, factory } = fakeWorkers();
        const runner = createRegexRunner({ workerFactory: factory });
        const first = runner.run({ type: 'matches' }).catch(() => 'stale');
        const second = runner.run({ type: 'matches' });
        workers[0].onmessage?.({ data: { id: 0, result: 'late answer' } });
        workers[1].onmessage({ data: { id: workers[1].messages[0].id, result: 'fresh' } });
        expect(await first).toBe('stale');
        await expect(second).resolves.toBe('fresh');
    });

    it('reports a worker that crashes or cannot start', async () => {
        const { workers, factory } = fakeWorkers();
        const runner = createRegexRunner({ workerFactory: factory });
        const crashed = runner.run({ type: 'matches' });
        workers[0].onerror({ message: 'boom' });
        await expect(crashed).rejects.toThrow('boom');
        expect(workers[0].terminated).toBe(true);

        const broken = createRegexRunner({ workerFactory: () => { throw new Error('no workers here'); } });
        await expect(broken.run({ type: 'matches' })).rejects.toThrow('could not start: no workers here');
    });

    it('close() stops the running job and the worker', async () => {
        const { workers, factory } = fakeWorkers();
        const runner = createRegexRunner({ workerFactory: factory });
        const pending = runner.run({ type: 'matches' }).catch((e) => e);
        runner.close();
        expect(isRegexSuperseded(await pending)).toBe(true);
        expect(workers[0].terminated).toBe(true);
    });
});
