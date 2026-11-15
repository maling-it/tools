<script>
    import { mergePdfs } from "#lib/pdfTools.js";
    import { formatBytes } from "#lib/image.js";
    import { announce } from "#lib/announce.svelte.js";

    let files = $state([]);
    let busy = $state(false);
    let error = $state("");
    let pdfUrl = $state("");
    let pages = $state(0);

    const reset = () => {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        pdfUrl = "";
        error = "";
    };
    const onFiles = (event) => {
        reset();
        files = [...files, ...event.currentTarget.files];
        event.currentTarget.value = "";
    };
    const remove = (index) => {
        reset();
        files = files.filter((_, i) => i !== index);
    };
    const move = (index, step) => {
        reset();
        const next = [...files];
        [next[index], next[index + step]] = [next[index + step], next[index]];
        files = next;
    };

    const merge = async () => {
        reset();
        busy = true;
        try {
            const inputs = await Promise.all(files.map(async (file) => ({ name: file.name, data: new Uint8Array(await file.arrayBuffer()) })));
            const bytes = await mergePdfs(inputs);
            pdfUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
            pages = (await import("pdf-lib").then((m) => m.PDFDocument.load(bytes))).getPageCount();
            announce(`Merged into one PDF with ${pages} pages`);
        } catch (e) {
            error = e.message;
        } finally {
            busy = false;
        }
    };
</script>

<svelte:head>
    <title>PDF Merge | Mools</title>
</svelte:head>

<h1>PDF Merge</h1>
<p class="text-body-secondary mb-3">Join several PDF files into one, in the order you choose. Files never leave your browser.</p>

<div class="card p-3">
    <div class="mb-3">
        <label for="pdf-files" class="form-label">PDF files</label>
        <input id="pdf-files" class="form-control" type="file" accept="application/pdf,.pdf" multiple onchange={onFiles} />
    </div>

    {#if files.length > 0}
        <ol class="list-group list-group-numbered mb-3">
            {#each files as file, index (file.name + index)}
                <li class="list-group-item d-flex align-items-center gap-2">
                    <span class="me-auto text-truncate">{file.name} <small class="text-body-secondary">{formatBytes(file.size)}</small></span>
                    <button class="btn btn-sm btn-outline-secondary" type="button" aria-label="Move {file.name} up" disabled={index === 0} onclick={() => move(index, -1)}><i class="bi bi-arrow-up"></i></button>
                    <button class="btn btn-sm btn-outline-secondary" type="button" aria-label="Move {file.name} down" disabled={index === files.length - 1} onclick={() => move(index, 1)}><i class="bi bi-arrow-down"></i></button>
                    <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Remove {file.name}" onclick={() => remove(index)}><i class="bi bi-x-lg"></i></button>
                </li>
            {/each}
        </ol>
    {/if}

    {#if error}<div class="alert alert-danger py-2" role="alert">{error}</div>{/if}

    <div class="d-flex gap-2 flex-wrap">
        <button class="btn btn-primary" type="button" disabled={files.length < 2 || busy} onclick={merge}>{busy ? "Merging..." : "Merge PDFs"}</button>
        {#if pdfUrl}
            <a class="btn btn-success" href={pdfUrl} download="merged.pdf"><i class="bi bi-download me-1"></i>Download merged.pdf ({pages} pages)</a>
        {/if}
    </div>
    {#if files.length === 1}<p class="small text-body-secondary mt-2 mb-0">Add at least one more file.</p>{/if}
</div>
