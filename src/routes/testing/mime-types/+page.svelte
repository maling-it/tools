<script>
    import { MIME_TYPES } from "#lib/reference.js";

    let query = $state("");

    const filtered = $derived(
        MIME_TYPES.filter((m) => `${m.extension} ${m.type}`.includes(query.trim().toLowerCase().replace(/^\./, "")))
    );
</script>

<svelte:head>
    <title>MIME Types | Mools</title>
</svelte:head>

<h1>MIME Types</h1>
<p class="text-body-secondary mb-3">Look up the Content-Type for a file extension, or the extension for a type.</p>

<input class="form-control mb-3" type="search" placeholder="Search by extension or MIME type, e.g. png or application/json" aria-label="Search MIME types" bind:value={query} />

<div class="card">
    <div class="table-responsive">
        <table class="table table-sm mb-0">
            <thead><tr><th>Extension</th><th>MIME type</th></tr></thead>
            <tbody>
                {#each filtered as mime (mime.extension)}
                    <tr><td><code>.{mime.extension}</code></td><td><code>{mime.type}</code></td></tr>
                {:else}
                    <tr><td colspan="2" class="text-body-secondary">Nothing matches "{query}".</td></tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
