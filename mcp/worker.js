// Runs tool calls off the main thread, so a runaway tool (for example a regular expression with catastrophic
// backtracking) can be stopped without freezing the MCP server.
import { parentPort } from 'node:worker_threads';
import { callAgentTool } from '../src/lib/agentTools.js';

// A few tools parse HTML or XML and need DOMParser. Node has none, so borrow jsdom's when it is installed.
const domReady = (async () => {
    try {
        const { JSDOM } = await import('jsdom');
        globalThis.DOMParser = new JSDOM('').window.DOMParser;
    } catch {
        // Without jsdom the DOM tools are not offered by the server, so nothing calls them.
    }
})();

parentPort.on('message', async ({ id, name, args }) => {
    await domReady;
    try {
        parentPort.postMessage({ id, ok: true, text: await callAgentTool(name, args) });
    } catch (error) {
        parentPort.postMessage({ id, ok: false, error: error?.message ?? String(error) });
    }
});
