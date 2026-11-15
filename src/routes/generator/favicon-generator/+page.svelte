<script>
    import { buildIco, faviconMarkup, FAVICON_SIZES } from "#lib/favicon.js";
    import { downloadZip, textBytes } from "#lib/zip.js";
    import { announce } from "#lib/announce.svelte.js";

    let image = $state(null);
    let previewUrl = $state("");
    let background = $state(false);
    let color = $state("#ffffff");
    let name = $state("My site");
    let themeColor = $state("#ffffff");
    let basePath = $state("/");
    let error = $state("");
    let busy = $state(false);

    const onFile = async (event) => {
        error = "";
        const file = event.currentTarget.files[0];
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = "";
        image = null;
        if (!file) return;
        try {
            image = await createImageBitmap(file);
            previewUrl = URL.createObjectURL(file);
        } catch {
            error = "That file could not be read as an image. Try a PNG, JPEG, WebP or SVG with a size set.";
        }
    };

    // Crops the middle square of the image and scales it to size x size pixels.
    const render = (size) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        if (background) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, size, size);
        }
        const side = Math.min(image.width, image.height);
        ctx.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size);
        return new Promise((resolve, reject) =>
            canvas.toBlob(async (blob) => (blob ? resolve(new Uint8Array(await blob.arrayBuffer())) : reject(new Error("The browser could not make a PNG."))), "image/png")
        );
    };

    const generate = async () => {
        error = "";
        busy = true;
        try {
            const files = [];
            const sized = {};
            for (const { size, name: fileName } of FAVICON_SIZES) {
                sized[size] = await render(size);
                files.push({ name: fileName, data: sized[size] });
            }
            files.push({ name: "favicon.ico", data: buildIco([16, 32, 48].map((size) => ({ size, data: sized[size] }))) });
            const { html, manifest } = faviconMarkup({ name, themeColor, basePath });
            files.push({ name: "site.webmanifest", data: textBytes(manifest) });
            files.push({ name: "head.html", data: textBytes(html + "\n") });
            downloadZip(files, "favicons.zip");
            announce("Favicon files saved in a ZIP");
        } catch (e) {
            error = e.message;
        } finally {
            busy = false;
        }
    };
</script>

<svelte:head>
    <title>Favicon Generator | Mools</title>
</svelte:head>

<h1>Favicon Generator</h1>
<p class="text-body-secondary mb-3">
    Turn one image into everything a site needs: favicon.ico, PNG icons from 16 to 512 pixels, an Apple touch icon, a web manifest and the HTML for your head. The middle square of the image is used. Files never leave your browser.
</p>

<div class="card p-3">
    <div class="mb-3">
        <label for="fav-file" class="form-label">Image (a square one of 512 pixels or more works best)</label>
        <input id="fav-file" class="form-control" type="file" accept="image/*" onchange={onFile} />
    </div>
    {#if previewUrl}
        <div class="d-flex align-items-end gap-3 mb-3" style:background={background ? color : null}>
            {#each [16, 32, 48, 96] as size (size)}
                <img src={previewUrl} width={size} height={size} alt="{size} pixel preview" style="object-fit: cover; object-position: center;" />
            {/each}
        </div>
    {/if}
    <div class="row g-3 mb-3">
        <div class="col-md-4">
            <label for="fav-name" class="form-label">Site name (for the manifest)</label>
            <input id="fav-name" class="form-control" type="text" bind:value={name} />
        </div>
        <div class="col-md-4">
            <label for="fav-base" class="form-label">Folder the files will live in</label>
            <input id="fav-base" class="form-control font-monospace" type="text" bind:value={basePath} placeholder="/" />
        </div>
        <div class="col-md-4">
            <label for="fav-theme" class="form-label">Theme color</label>
            <input id="fav-theme" class="form-control form-control-color" type="color" bind:value={themeColor} />
        </div>
    </div>
    <div class="d-flex flex-wrap align-items-center gap-3 mb-3">
        <div class="form-check">
            <input id="fav-bg" class="form-check-input" type="checkbox" bind:checked={background} />
            <label class="form-check-label" for="fav-bg">Fill transparent areas</label>
        </div>
        {#if background}
            <label class="visually-hidden" for="fav-color">Fill color</label>
            <input id="fav-color" class="form-control form-control-color" type="color" bind:value={color} />
        {/if}
    </div>
    {#if error}<div class="alert alert-danger py-2" role="alert">{error}</div>{/if}
    <div><button class="btn btn-primary" type="button" disabled={!image || busy} onclick={generate}>{busy ? "Working..." : "Download ZIP"}</button></div>
</div>
