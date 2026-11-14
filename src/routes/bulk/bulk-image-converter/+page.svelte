<script>
    import { convertHeic, formatBytes, isHeic } from "#lib/image.js";
    import { downloadZip } from "#lib/zip.js";

    const FORMATS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

    let files = $state([]);
    let type = $state("image/webp");
    let quality = $state(85);
    let maxWidth = $state(0);
    let maxHeight = $state(0);
    let results = $state([]);
    let busy = $state(false);
    let progress = $state(0);

    const clearResults = () => {
        results.forEach((r) => r.url && URL.revokeObjectURL(r.url));
        results = [];
    };

    const onPick = (event) => {
        files = [...files, ...event.currentTarget.files];
        event.currentTarget.value = "";
        clearResults();
    };

    const convertOne = async (file) => {
        const source = isHeic(file) ? await convertHeic(file, "image/jpeg", 0.95) : file;
        const bitmap = await createImageBitmap(source);
        const limit = (max, size) => (max > 0 ? max / size : 1);
        const scale = Math.min(1, limit(Number(maxWidth), bitmap.width), limit(Number(maxHeight), bitmap.height));
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (type === "image/jpeg") {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, width, height);
        }
        context.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality / 100));
        if (!blob || blob.type !== type) throw new Error("This browser cannot create that format.");
        return { blob, width, height };
    };

    const run = async () => {
        clearResults();
        busy = true;
        progress = 0;
        const ext = FORMATS[type];
        for (const file of files) {
            const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
            try {
                const { blob, width, height } = await convertOne(file);
                results.push({ name, width, height, before: file.size, after: blob.size, blob, url: URL.createObjectURL(blob), error: "" });
            } catch (e) {
                results.push({ name: file.name, error: e.message?.includes("format") ? e.message : "Could not read this image." });
            }
            progress++;
        }
        busy = false;
    };

    const zip = async () => {
        const entries = [];
        for (const r of results.filter((r) => r.blob)) entries.push({ name: r.name, data: new Uint8Array(await r.blob.arrayBuffer()) });
        downloadZip(entries, "images.zip");
    };

    const saved = $derived.by(() => {
        const ok = results.filter((r) => r.blob);
        const before = ok.reduce((s, r) => s + r.before, 0);
        const after = ok.reduce((s, r) => s + r.after, 0);
        return before ? Math.round((1 - after / before) * 100) : 0;
    });
</script>

<svelte:head>
    <title>Bulk Image Converter | Mools</title>
</svelte:head>

<h1>Bulk Image Converter</h1>
<p class="text-body-secondary mb-3">Convert, resize and compress many images at once and download them as a ZIP. HEIC photos are supported. Images never leave your browser.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="files" class="form-label">Images</label>
                <input id="files" class="form-control" type="file" accept="image/*,.heic,.heif" multiple disabled={busy} onchange={onPick} />
            </div>
            <div class="mb-3">
                <label for="type" class="form-label">Convert to</label>
                <select id="type" class="form-select" bind:value={type}>
                    <option value="image/webp">WebP</option>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                </select>
            </div>
            {#if type !== "image/png"}
                <div class="mb-3">
                    <label for="quality" class="form-label">Quality: {quality}%</label>
                    <input id="quality" class="form-range" type="range" min="10" max="100" bind:value={quality} />
                </div>
            {/if}
            <div class="row g-2 mb-3">
                <div class="col-6">
                    <label for="max-width" class="form-label small mb-0">Max width (px)</label>
                    <input id="max-width" class="form-control" type="number" min="0" bind:value={maxWidth} />
                </div>
                <div class="col-6">
                    <label for="max-height" class="form-label small mb-0">Max height (px)</label>
                    <input id="max-height" class="form-control" type="number" min="0" bind:value={maxHeight} />
                </div>
                <div class="form-text">0 keeps the original size. The aspect ratio is always kept.</div>
            </div>
            <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" type="button" disabled={!files.length || busy} onclick={run}>{busy ? `Converting ${progress}/${files.length}...` : `Convert ${files.length || ""} image${files.length === 1 ? "" : "s"}`}</button>
                <button class="btn btn-outline-secondary" type="button" disabled={!files.length || busy} onclick={() => { files = []; clearResults(); }}>Clear</button>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        <div class="card p-3">
            {#if results.length}
                <div class="d-flex align-items-center mb-3">
                    <h2 class="h5 mb-0 me-auto">Results{saved > 0 ? ` (${saved}% smaller)` : ""}</h2>
                    <button class="btn btn-success btn-sm" type="button" disabled={!results.some((r) => r.blob)} onclick={zip}><i class="bi bi-file-earmark-zip me-1"></i>Download ZIP</button>
                </div>
                <ul class="list-group">
                    {#each results as result, i (i)}
                        <li class="list-group-item d-flex align-items-center gap-2">
                            {#if result.url}<img src={result.url} alt="" width="40" height="40" style="object-fit: cover;" class="rounded" />{/if}
                            <div class="me-auto text-truncate">
                                <div class="text-truncate">{result.name}</div>
                                {#if result.error}
                                    <small class="text-danger">{result.error}</small>
                                {:else}
                                    <small class="text-body-secondary">{result.width}×{result.height} · {formatBytes(result.before)} → {formatBytes(result.after)}</small>
                                {/if}
                            </div>
                            {#if result.url}<a class="btn btn-sm btn-outline-secondary" href={result.url} download={result.name} aria-label="Download {result.name}"><i class="bi bi-download"></i></a>{/if}
                        </li>
                    {/each}
                </ul>
            {:else if files.length}
                <h2 class="h5">{files.length} image{files.length === 1 ? "" : "s"} selected</h2>
                <ul class="mb-0 small text-body-secondary">
                    {#each files.slice(0, 12) as file, i (i)}<li class="text-truncate">{file.name} ({formatBytes(file.size)})</li>{/each}
                    {#if files.length > 12}<li>and {files.length - 12} more</li>{/if}
                </ul>
            {:else}
                <p class="text-body-secondary mb-0">Choose images to get started.</p>
            {/if}
        </div>
    </div>
</div>
