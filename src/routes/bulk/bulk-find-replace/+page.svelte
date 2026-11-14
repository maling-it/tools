<script>
    import { replaceText } from "#lib/textUtils.js";
    import { formatBytes } from "#lib/image.js";
    import { downloadZip, textBytes } from "#lib/zip.js";
    import { shouldIgnorePath } from "#lib/vibe.js";

    const MAX_BYTES = 2_000_000;

    let docs = $state([]);
    let skipped = $state([]);
    let find = $state("");
    let replacement = $state("");
    let regex = $state(false);
    let caseSensitive = $state(true);
    let busy = $state(false);

    const onPick = async (event) => {
        const picked = [...event.currentTarget.files];
        event.currentTarget.value = "";
        busy = true;
        const ok = [];
        const bad = [];
        for (const file of picked) {
            const path = file.webkitRelativePath || file.name;
            if (shouldIgnorePath(path)) bad.push(`${path} (ignored)`);
            else if (file.size > MAX_BYTES) bad.push(`${path} (over ${formatBytes(MAX_BYTES)})`);
            else {
                const text = await file.text();
                if (text.includes("\u0000")) bad.push(`${path} (binary)`);
                else ok.push({ name: path, text });
            }
        }
        docs = ok;
        skipped = bad;
        busy = false;
    };

    const results = $derived.by(() => {
        if (!find) return { rows: docs.map((d) => ({ ...d, out: d.text, count: 0 })), error: "" };
        try {
            return { rows: docs.map((d) => ({ ...d, ...(({ text, count }) => ({ out: text, count }))(replaceText(d.text, find, replacement, { regex, caseSensitive })) })), error: "" };
        } catch {
            return { rows: [], error: "That regular expression is not valid." };
        }
    });

    const changedRows = $derived(results.rows.filter((r) => r.count > 0));
    const total = $derived(changedRows.reduce((sum, r) => sum + r.count, 0));
</script>

<svelte:head>
    <title>Bulk File Find & Replace | Mools</title>
</svelte:head>

<h1>Bulk File Find & Replace</h1>
<p class="text-body-secondary mb-3">Search and replace text across many files at once, see how many matches each file has and download the changed files as a ZIP. Files stay in your browser. Binary files, lock files and secrets such as <code>.env</code> are skipped.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="folder" class="form-label">Choose a folder</label>
                <input id="folder" class="form-control" type="file" webkitdirectory multiple disabled={busy} onchange={onPick} />
            </div>
            <div class="mb-3">
                <label for="files" class="form-label">Or choose files</label>
                <input id="files" class="form-control" type="file" multiple disabled={busy} onchange={onPick} />
            </div>
            <div class="mb-3"><label for="find" class="form-label">Find</label><input id="find" class="form-control font-monospace" bind:value={find} spellcheck="false" /></div>
            <div class="mb-3"><label for="replacement" class="form-label">Replace with</label><input id="replacement" class="form-control font-monospace" bind:value={replacement} spellcheck="false" /></div>
            <div class="d-flex gap-3 mb-3">
                <div class="form-check"><input id="regex" class="form-check-input" type="checkbox" bind:checked={regex} /><label class="form-check-label" for="regex">Regex</label></div>
                <div class="form-check"><input id="case" class="form-check-input" type="checkbox" bind:checked={caseSensitive} /><label class="form-check-label" for="case">Case sensitive</label></div>
            </div>
            <div>
                <button class="btn btn-success" type="button" disabled={!changedRows.length} onclick={() => downloadZip(changedRows.map((r) => ({ name: r.name, data: textBytes(r.out) })), "replaced-files.zip")}>
                    <i class="bi bi-file-earmark-zip me-1"></i>Download {changedRows.length} changed file{changedRows.length === 1 ? "" : "s"}
                </button>
            </div>
            {#if skipped.length}
                <details class="mt-3"><summary class="small text-body-secondary">{skipped.length} files skipped</summary>
                    <ul class="small mt-2 mb-0">{#each skipped.slice(0, 40) as item (item)}<li class="text-break">{item}</li>{/each}</ul>
                </details>
            {/if}
        </div>
    </div>
    <div class="col-lg-7">
        {#if results.error}
            <div class="alert alert-danger" role="alert">{results.error}</div>
        {:else}
            <div class="card p-3">
                <h2 class="h5">{docs.length} file{docs.length === 1 ? "" : "s"} loaded{find ? `, ${total} replacement${total === 1 ? "" : "s"} in ${changedRows.length} file${changedRows.length === 1 ? "" : "s"}` : ""}</h2>
                {#if docs.length}
                    <ul class="list-group" style="max-height: 28rem; overflow-y: auto;">
                        {#each results.rows.slice(0, 300) as row (row.name)}
                            <li class="list-group-item d-flex gap-2 align-items-center">
                                <span class="me-auto text-break">{row.name}</span>
                                {#if find}<span class="badge {row.count ? 'text-bg-primary' : 'bg-body-secondary text-body-secondary'}">{row.count}</span>{/if}
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p class="text-body-secondary mb-0">Choose a folder or files to get started.</p>
                {/if}
            </div>
        {/if}
    </div>
</div>
