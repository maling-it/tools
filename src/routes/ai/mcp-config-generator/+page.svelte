<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { MCP_CLIENTS, buildMcpConfig } from "#lib/vibe.js";

    let form = $state({ client: "claude-desktop", name: "mools", command: "node", args: "/absolute/path/to/mcp/server.js", env: "" });

    const result = $derived.by(() => {
        try {
            return { text: buildMcpConfig(form), error: "" };
        } catch (e) {
            return { text: "", error: e.message };
        }
    });
</script>

<svelte:head>
    <title>MCP Config Generator | Mools</title>
</svelte:head>

<h1>MCP Config Generator</h1>
<p class="text-body-secondary mb-3">Generate the configuration that connects a Model Context Protocol server to Claude Desktop, Cursor, VS Code or Claude Code.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="client" class="form-label">Client</label>
                <select id="client" class="form-select" bind:value={form.client}>
                    {#each Object.entries(MCP_CLIENTS) as [id, meta] (id)}
                        <option value={id}>{meta.label}</option>
                    {/each}
                </select>
            </div>
            <div class="row g-2 mb-3">
                <div class="col-6">
                    <label for="name" class="form-label">Server name</label>
                    <input id="name" class="form-control" bind:value={form.name} />
                </div>
                <div class="col-6">
                    <label for="command" class="form-label">Command</label>
                    <input id="command" class="form-control font-monospace" bind:value={form.command} spellcheck="false" />
                </div>
            </div>
            <div class="mb-3">
                <label for="args" class="form-label">Arguments (one per line)</label>
                <textarea id="args" class="form-control font-monospace" rows="3" spellcheck="false" bind:value={form.args}></textarea>
            </div>
            <div>
                <label for="env" class="form-label">Environment variables (NAME=value, one per line)</label>
                <textarea id="env" class="form-control font-monospace" rows="3" spellcheck="false" bind:value={form.env}></textarea>
                <div class="form-text">Never commit real API keys. Prefer reading secrets from your environment.</div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {/if}
        <OutputCard title={MCP_CLIENTS[form.client].path === "terminal" ? "Run in your terminal" : `Save as ${MCP_CLIENTS[form.client].path}`} text={result.text} filename={form.client === "claude-code" ? "" : "mcp.json"} mime="application/json" />
    </div>
</div>
