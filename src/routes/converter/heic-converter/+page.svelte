<script>
    import { convertHeic, formatBytes } from "#lib/image.js";

    const formats = {
        "image/jpeg": { label: "JPG", ext: "jpg" },
        "image/png": { label: "PNG", ext: "png" },
        "image/gif": { label: "GIF", ext: "gif" }
    };

    let type = $state("image/jpeg");
    let quality = $state(90);
    let busy = $state(false);
    let results = $state([]);

    const clear = () => {
        results.forEach((result) => result.url && URL.revokeObjectURL(result.url));
        results = [];
    };

    const onFiles = async (event) => {
        const files = [...event.currentTarget.files];
        event.currentTarget.value = "";
        if (files.length === 0) return;
        clear();
        busy = true;
        const { ext } = formats[type];
        for (const file of files) {
            try {
                const blob = await convertHeic(file, type, quality / 100);
                results.push({
                    name: file.name.replace(/\.[^.]+$/, "") + "." + ext,
                    size: blob.size,
                    url: URL.createObjectURL(blob)
                });
            } catch {
                results.push({ name: file.name, error: "Could not convert this file. Is it a valid HEIC image?" });
            }
        }
        busy = false;
    };
</script>

<svelte:head>
    <title>HEIC to JPG / PNG / GIF | Mools</title>
</svelte:head>

<h1>HEIC to JPG / PNG / GIF</h1>
<p class="text-body-secondary mb-3">Convert HEIC photos from your iPhone into common formats. Files never leave your browser.</p>

<div class="card p-3">
    <div class="d-flex gap-3 flex-wrap mb-3">
        <div>
            <label for="format" class="form-label">Convert to</label>
            <select id="format" class="form-select" bind:value={type}>
                {#each Object.entries(formats) as [value, format] (value)}
                    <option {value}>{format.label}</option>
                {/each}
            </select>
        </div>
        {#if type !== "image/png"}
            <div>
                <label for="quality" class="form-label">Quality: {quality}%</label>
                <input id="quality" class="form-range" type="range" min="10" max="100" bind:value={quality} />
            </div>
        {/if}
    </div>
    <div class="mb-3">
        <label for="files" class="form-label">HEIC files</label>
        <input id="files" class="form-control" type="file" accept=".heic,.heif,image/heic,image/heif" multiple disabled={busy} onchange={onFiles} />
    </div>

    {#if busy}
        <p class="text-body-secondary mb-0">Converting...</p>
    {/if}

    {#if results.length > 0}
        <ul class="list-group">
            {#each results as result (result.name)}
                <li class="list-group-item d-flex align-items-center gap-2">
                    <span class="me-auto text-truncate">{result.name}</span>
                    {#if result.error}
                        <span class="text-danger small">{result.error}</span>
                    {:else}
                        <small class="text-body-secondary">{formatBytes(result.size)}</small>
                        <a class="btn btn-sm btn-success" href={result.url} download={result.name}>
                            <i class="bi bi-download me-1"></i>Download
                        </a>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</div>
