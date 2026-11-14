<script>
    import { imagesToPdf, formatBytes } from "#lib/image.js";

    let { title, description, accept, formatName } = $props();

    let files = $state([]);
    let pageSize = $state("image");
    let busy = $state(false);
    let error = $state("");
    let pdfUrl = $state("");

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

    const convert = async () => {
        reset();
        busy = true;
        try {
            const bytes = await imagesToPdf(files, { pageSize });
            pdfUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
        } catch (e) {
            error = `Conversion failed: ${e.message}`;
        } finally {
            busy = false;
        }
    };
</script>

<svelte:head>
    <title>{title} | Mools</title>
</svelte:head>

<h1>{title}</h1>
<p class="text-body-secondary mb-3">{description} Files never leave your browser.</p>

<div class="card p-3">
    <div class="mb-3">
        <label for="files" class="form-label">{formatName} images</label>
        <input id="files" class="form-control" type="file" {accept} multiple onchange={onFiles} />
    </div>

    {#if files.length > 0}
        <ol class="list-group list-group-numbered mb-3">
            {#each files as file, index (file.name + index)}
                <li class="list-group-item d-flex align-items-center gap-2">
                    <span class="me-auto text-truncate">{file.name} <small class="text-body-secondary">{formatBytes(file.size)}</small></span>
                    <button class="btn btn-sm btn-outline-secondary" type="button" aria-label="Move up" disabled={index === 0} onclick={() => move(index, -1)}>
                        <i class="bi bi-arrow-up"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" type="button" aria-label="Move down" disabled={index === files.length - 1} onclick={() => move(index, 1)}>
                        <i class="bi bi-arrow-down"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Remove" onclick={() => remove(index)}>
                        <i class="bi bi-x-lg"></i>
                    </button>
                </li>
            {/each}
        </ol>
    {/if}

    <div class="mb-3">
        <label for="page-size" class="form-label">Page size</label>
        <select id="page-size" class="form-select w-auto" bind:value={pageSize} onchange={reset}>
            <option value="image">Same as image</option>
            <option value="a4">A4 with margin</option>
        </select>
    </div>

    {#if error}
        <div class="alert alert-danger py-2" role="alert">{error}</div>
    {/if}

    <div class="d-flex gap-2 flex-wrap">
        <button class="btn btn-primary" type="button" disabled={files.length === 0 || busy} onclick={convert}>
            {busy ? "Converting..." : "Convert to PDF"}
        </button>
        {#if pdfUrl}
            <a class="btn btn-success" href={pdfUrl} download="images.pdf"><i class="bi bi-download me-1"></i>Download PDF</a>
        {/if}
    </div>
</div>
