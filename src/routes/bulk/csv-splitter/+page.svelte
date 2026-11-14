<script>
    import { parseCsv } from "#lib/converters.js";
    import { splitCsv } from "#lib/bulk.js";
    import { downloadZip, textBytes } from "#lib/zip.js";
    import { formatBytes } from "#lib/image.js";

    let csv = $state("");
    let fileName = $state("data.csv");
    let rowsPerFile = $state(1000);
    let header = $state(true);
    let delimiter = $state(",");

    const result = $derived.by(() => {
        if (!csv.trim()) return { parts: [], total: 0, error: "" };
        try {
            const parts = splitCsv(csv, { rowsPerFile: Number(rowsPerFile), header, delimiter });
            return { parts, total: parseCsv(csv, delimiter).length - (header ? 1 : 0), error: "" };
        } catch (e) {
            return { parts: [], total: 0, error: e.message };
        }
    });

    const base = $derived(fileName.replace(/\.[^.]+$/, "") || "data");
    const nameOf = (i) => `${base}-part-${String(i + 1).padStart(3, "0")}.csv`;

    const onPick = async (event) => {
        const file = event.currentTarget.files[0];
        if (!file) return;
        fileName = file.name;
        csv = await file.text();
    };
</script>

<svelte:head>
    <title>CSV Splitter | Mools</title>
</svelte:head>

<h1>CSV Splitter</h1>
<p class="text-body-secondary mb-3">Split a large CSV into smaller files with a fixed number of rows each, repeating the header, and download them as a ZIP. Quoted fields with line breaks stay intact.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="file" class="form-label">Choose a CSV file</label>
                <input id="file" class="form-control" type="file" accept=".csv,text/csv,text/plain" onchange={onPick} />
            </div>
            <div class="mb-3">
                <label for="csv" class="form-label">Or paste CSV</label>
                <textarea id="csv" class="form-control font-monospace" rows="8" spellcheck="false" bind:value={csv}></textarea>
            </div>
            <div class="d-flex gap-3 flex-wrap align-items-end">
                <div>
                    <label for="rows" class="form-label">Rows per file</label>
                    <input id="rows" class="form-control" type="number" min="1" bind:value={rowsPerFile} style="max-width: 9rem" />
                </div>
                <div>
                    <label for="delimiter" class="form-label">Delimiter</label>
                    <select id="delimiter" class="form-select" bind:value={delimiter}><option value=",">Comma</option><option value=";">Semicolon</option><option value={"\t"}>Tab</option><option value="|">Pipe</option></select>
                </div>
                <div class="form-check mb-2"><input id="header" class="form-check-input" type="checkbox" bind:checked={header} /><label class="form-check-label" for="header">First row is a header</label></div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {:else if result.parts.length}
            <div class="card p-3">
                <div class="d-flex align-items-center mb-2">
                    <h2 class="h5 mb-0 me-auto">{result.total.toLocaleString()} rows into {result.parts.length} file{result.parts.length === 1 ? "" : "s"}</h2>
                    <button class="btn btn-success btn-sm" type="button" onclick={() => downloadZip(result.parts.map((text, i) => ({ name: nameOf(i), data: textBytes(text) })), `${base}-split.zip`)}><i class="bi bi-file-earmark-zip me-1"></i>Download ZIP</button>
                </div>
                <ul class="list-group" style="max-height: 24rem; overflow-y: auto;">
                    {#each result.parts.slice(0, 200) as part, i (i)}
                        <li class="list-group-item d-flex justify-content-between"><span>{nameOf(i)}</span><span class="text-body-secondary small">{formatBytes(part.length)}</span></li>
                    {/each}
                </ul>
                {#if result.parts.length > 200}<p class="small text-body-secondary mt-2 mb-0">Showing 200 of {result.parts.length}. The ZIP has all of them.</p>{/if}
            </div>
        {:else}
            <div class="card p-3 text-body-secondary">The parts appear here.</div>
        {/if}
    </div>
</div>
