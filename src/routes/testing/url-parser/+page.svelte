<script>
    import StatRows from "../../../components/StatRows.svelte";
    import { parseUrl } from "#lib/netSecurity.js";

    let input = $state("https://user:pass@example.com:8080/path/to/page?query=1&tag=a&tag=b#section");

    const result = $derived.by(() => {
        if (!input.trim()) return { data: null, error: "" };
        try {
            return { data: parseUrl(input), error: "" };
        } catch (e) {
            return { data: null, error: e.message };
        }
    });
</script>

<svelte:head>
    <title>URL Parser | Mools</title>
</svelte:head>

<h1>URL Parser</h1>
<p class="text-body-secondary mb-3">Break a URL into protocol, host, port, path, query parameters and hash.</p>

<div class="card p-3 mb-3">
    <label for="url" class="form-label">URL</label>
    <input id="url" class="form-control font-monospace" bind:value={input} spellcheck="false" />
</div>

{#if result.error}
    <div class="alert alert-danger" role="alert">{result.error}</div>
{:else if result.data}
    {@const u = result.data}
    <div class="row g-3">
        <div class="col-lg-6">
            <StatRows title="Parts" copyable rows={[["Protocol", u.protocol], ["Username", u.username || "-"], ["Password", u.password || "-"], ["Host", u.host], ["Hostname", u.hostname], ["Port", u.port || "default"], ["Origin", u.origin], ["Path", u.pathname], ["Query", u.search || "-"], ["Hash", u.hash || "-"]]} />
        </div>
        <div class="col-lg-6">
            <div class="card p-3">
                <h2 class="h5 card-title">Query parameters</h2>
                <table class="table table-sm mb-0">
                    <tbody>
                        {#each u.params as [key, value], i (i)}
                            <tr><th scope="row" class="fw-normal text-break">{key}</th><td class="text-break">{value}</td></tr>
                        {:else}
                            <tr><td class="text-body-secondary">No query parameters.</td></tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
{/if}
