<script>
    import { hashBuffer } from "#lib/bulk.js";
    import { formatBytes } from "#lib/image.js";
    import { copyToClipboard } from "#lib/textUtils.js";
    import { downloadBlob } from "#lib/zip.js";

    const ALGORITHMS = [["md5", "MD5"], ["sha1", "SHA-1"], ["sha256", "SHA-256"], ["sha512", "SHA-512"]];

    let results = $state([]);
    let busy = $state(false);
    let done = $state(0);
    let total = $state(0);
    let algorithm = $state("sha256");
    let copied = $state(false);

    const onPick = async (event) => {
        const files = [...event.currentTarget.files];
        event.currentTarget.value = "";
        if (!files.length) return;
        results = [];
        busy = true;
        total = files.length;
        done = 0;
        for (const file of files) {
            const path = file.webkitRelativePath || file.name;
            try {
                results.push({ name: path, size: file.size, hashes: await hashBuffer(await file.arrayBuffer()), error: "" });
            } catch (e) {
                results.push({ name: path, size: file.size, hashes: null, error: `Could not read the file (${e.message}).` });
            }
            done++;
        }
        busy = false;
    };

    // "hash  filename" lines, compatible with `sha256sum -c` and friends.
    const checksumText = $derived(results.filter((r) => r.hashes).map((r) => `${r.hashes[algorithm]}  ${r.name}`).join("\n"));

    const copy = async () => {
        if (await copyToClipboard(checksumText)) {
            copied = true;
            setTimeout(() => (copied = false), 1200);
        }
    };

    const csv = () => {
        const rows = results.filter((r) => r.hashes).map((r) => [r.name, r.size, ...ALGORITHMS.map(([id]) => r.hashes[id])]);
        const quote = (v) => `"${String(v).replace(/"/g, '""')}"`;
        const text = [["file", "bytes", ...ALGORITHMS.map(([, label]) => label)], ...rows].map((row) => row.map(quote).join(",")).join("\n");
        downloadBlob(new Blob([text], { type: "text/csv" }), "hashes.csv");
    };
</script>

<svelte:head>
    <title>Bulk File Hasher | Mools</title>
</svelte:head>

<h1>Bulk File Hasher</h1>
<p class="text-body-secondary mb-3">Compute MD5, SHA-1, SHA-256 and SHA-512 for many files at once, for example to verify downloads. Files are read in your browser and never uploaded.</p>

<div class="card p-3 mb-3">
    <div class="row g-3 align-items-end">
        <div class="col-md-6">
            <label for="files" class="form-label">Files</label>
            <input id="files" class="form-control" type="file" multiple disabled={busy} onchange={onPick} />
        </div>
        <div class="col-md-3">
            <label for="algorithm" class="form-label">Checksum list uses</label>
            <select id="algorithm" class="form-select" bind:value={algorithm}>
                {#each ALGORITHMS as [id, label] (id)}<option value={id}>{label}</option>{/each}
            </select>
        </div>
        <div class="col-md-3 d-flex gap-2">
            <button class="btn btn-outline-secondary" type="button" disabled={!checksumText} onclick={copy}><i class="bi {copied ? 'bi-check2' : 'bi-clipboard'} me-1"></i>{copied ? "Copied" : "Copy list"}</button>
            <button class="btn btn-outline-secondary" type="button" disabled={!checksumText} onclick={csv}><i class="bi bi-download me-1"></i>CSV</button>
        </div>
    </div>
    {#if busy}
        <div class="progress mt-3" role="progressbar" aria-label="Hashing progress" aria-valuenow={done} aria-valuemin="0" aria-valuemax={total}>
            <div class="progress-bar" style="width: {(done / total) * 100}%">{done} / {total}</div>
        </div>
    {/if}
</div>

{#if results.length}
    <div class="card">
        <div class="table-responsive">
            <table class="table table-sm align-middle mb-0">
                <thead><tr><th>File</th><th class="text-end">Size</th>{#each ALGORITHMS as [, label] (label)}<th>{label}</th>{/each}</tr></thead>
                <tbody>
                    {#each results as result, i (i)}
                        <tr>
                            <td class="text-break">{result.name}</td>
                            <td class="text-end text-nowrap">{formatBytes(result.size)}</td>
                            {#if result.hashes}
                                {#each ALGORITHMS as [id] (id)}
                                    <td><code class="small hash" title={result.hashes[id]}>{result.hashes[id]}</code></td>
                                {/each}
                            {:else}
                                <td colspan="4" class="text-danger small">{result.error}</td>
                            {/if}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
{/if}

<style>
    .hash {
        display: inline-block;
        max-width: 11rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
    }
</style>
