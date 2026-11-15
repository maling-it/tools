<script>
    import { extractPages, pdfPageCount, splitPdf } from "#lib/pdfTools.js";
    import { downloadBlob, downloadZip } from "#lib/zip.js";
    import { announce } from "#lib/announce.svelte.js";

    let file = $state(null);
    let bytes = $state(null);
    let total = $state(0);
    let mode = $state("extract");
    let ranges = $state("");
    let busy = $state(false);
    let error = $state("");
    let done = $state("");

    const onFile = async (event) => {
        error = "";
        done = "";
        file = event.currentTarget.files[0] ?? null;
        bytes = null;
        total = 0;
        if (!file) return;
        try {
            bytes = new Uint8Array(await file.arrayBuffer());
            total = await pdfPageCount(bytes, file.name);
        } catch (e) {
            error = e.message;
            file = null;
            bytes = null;
        }
    };

    const run = async () => {
        error = "";
        done = "";
        busy = true;
        try {
            const stem = file.name.replace(/\.pdf$/i, "");
            if (mode === "extract") {
                const out = await extractPages(bytes, ranges, file.name);
                downloadBlob(new Blob([out], { type: "application/pdf" }), `${stem}-selected.pdf`);
                done = "Saved the selected pages as one PDF.";
            } else {
                const parts = await splitPdf(bytes, { mode, ranges, name: file.name });
                downloadZip(parts, `${stem}-split.zip`);
                done = `Saved ${parts.length} ${parts.length === 1 ? "file" : "files"} in a ZIP.`;
            }
            announce(done);
        } catch (e) {
            error = e.message;
        } finally {
            busy = false;
        }
    };
</script>

<svelte:head>
    <title>PDF Split | Mools</title>
</svelte:head>

<h1>PDF Split</h1>
<p class="text-body-secondary mb-3">Take pages out of a PDF, or split it into several files. Files never leave your browser.</p>

<div class="card p-3">
    <div class="mb-3">
        <label for="split-file" class="form-label">PDF file</label>
        <input id="split-file" class="form-control" type="file" accept="application/pdf,.pdf" onchange={onFile} />
        {#if total}<div class="form-text" aria-live="polite">{file.name} has {total} {total === 1 ? "page" : "pages"}.</div>{/if}
    </div>

    <fieldset class="mb-3">
        <legend class="form-label fs-6">What to do</legend>
        <div class="form-check">
            <input class="form-check-input" type="radio" id="mode-extract" value="extract" bind:group={mode} />
            <label class="form-check-label" for="mode-extract">Keep only some pages (one PDF)</label>
        </div>
        <div class="form-check">
            <input class="form-check-input" type="radio" id="mode-ranges" value="ranges" bind:group={mode} />
            <label class="form-check-label" for="mode-ranges">Split into groups (ZIP of PDFs)</label>
        </div>
        <div class="form-check">
            <input class="form-check-input" type="radio" id="mode-each" value="each" bind:group={mode} />
            <label class="form-check-label" for="mode-each">One file per page (ZIP of PDFs)</label>
        </div>
    </fieldset>

    {#if mode !== "each"}
        <div class="mb-3">
            <label for="split-ranges" class="form-label">{mode === "extract" ? "Pages to keep" : "Groups, separated by semicolons"}</label>
            <input id="split-ranges" class="form-control font-monospace" type="text" bind:value={ranges} placeholder={mode === "extract" ? "1-3, 5, 8-" : "1-3; 4-6; 7-"} autocomplete="off" spellcheck="false" />
            <div class="form-text">{mode === "extract" ? "Pages are kept in the order you write them, so 3, 1 puts page 3 first." : "Each group becomes its own file."} An open end such as 8- means up to the last page.</div>
        </div>
    {/if}

    {#if error}<div class="alert alert-danger py-2" role="alert">{error}</div>{/if}
    {#if done}<div class="alert alert-success py-2" role="status">{done}</div>{/if}

    <div>
        <button class="btn btn-primary" type="button" disabled={!bytes || busy} onclick={run}>{busy ? "Working..." : mode === "extract" ? "Extract pages" : "Split"}</button>
    </div>
</div>
