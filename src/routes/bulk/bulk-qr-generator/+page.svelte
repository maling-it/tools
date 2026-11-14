<script>
    import { slugify } from "#lib/devUtils.js";
    import { downloadZip, textBytes } from "#lib/zip.js";

    const MAX = 500;

    let text = $state("https://example.com\nhttps://example.org\nWIFI:T:WPA;S:MyNetwork;P:secret123;;");
    let format = $state("png");
    let size = $state(300);
    let margin = $state(2);
    let level = $state("M");
    let items = $state([]);
    let busy = $state(false);
    let error = $state("");

    const lines = $derived(text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean));

    const dataUrlToBytes = (dataUrl) => Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));

    const generate = async () => {
        error = "";
        if (lines.length > MAX) {
            error = `Please use at most ${MAX} lines at a time (you have ${lines.length}).`;
            return;
        }
        busy = true;
        try {
            const { default: QRCode } = await import("qrcode");
            const options = { width: size, margin, errorCorrectionLevel: level };
            const out = [];
            for (const [index, content] of lines.entries()) {
                const name = `${String(index + 1).padStart(3, "0")}-${slugify(content).slice(0, 40) || "qr"}.${format}`;
                if (format === "svg") {
                    const svg = await QRCode.toString(content, { ...options, type: "svg" });
                    out.push({ name, content, preview: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, data: textBytes(svg) });
                } else {
                    const dataUrl = await QRCode.toDataURL(content, options);
                    out.push({ name, content, preview: dataUrl, data: dataUrlToBytes(dataUrl) });
                }
            }
            items = out;
        } catch (e) {
            items = [];
            error = e.message.includes("too big") ? "One of the lines has too much text for a QR code." : e.message;
        } finally {
            busy = false;
        }
    };
</script>

<svelte:head>
    <title>Bulk QR Code Generator | Mools</title>
</svelte:head>

<h1>Bulk QR Code Generator</h1>
<p class="text-body-secondary mb-3">Turn a list of links or texts into one QR code each and download them all as a ZIP. Up to {MAX} codes at a time.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="text" class="form-label">One value per line ({lines.length})</label>
                <textarea id="text" class="form-control font-monospace" rows="9" spellcheck="false" bind:value={text}></textarea>
            </div>
            <div class="row g-2 mb-3">
                <div class="col-6">
                    <label for="format" class="form-label small mb-0">Format</label>
                    <select id="format" class="form-select" bind:value={format}><option value="png">PNG</option><option value="svg">SVG</option></select>
                </div>
                <div class="col-6">
                    <label for="level" class="form-label small mb-0">Error correction</label>
                    <select id="level" class="form-select" bind:value={level}><option value="L">Low</option><option value="M">Medium</option><option value="Q">Quartile</option><option value="H">High</option></select>
                </div>
            </div>
            <div class="mb-3">
                <label for="size" class="form-label small mb-0">Size: {size}px</label>
                <input id="size" class="form-range" type="range" min="128" max="1024" step="32" bind:value={size} />
            </div>
            <div class="mb-3">
                <label for="margin" class="form-label small mb-0">Margin: {margin}</label>
                <input id="margin" class="form-range" type="range" min="0" max="10" bind:value={margin} />
            </div>
            {#if error}<div class="alert alert-danger py-2" role="alert">{error}</div>{/if}
            <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" type="button" disabled={!lines.length || busy} onclick={generate}>{busy ? "Generating..." : `Generate ${lines.length} code${lines.length === 1 ? "" : "s"}`}</button>
                <button class="btn btn-success" type="button" disabled={!items.length} onclick={() => downloadZip(items.map((i) => ({ name: i.name, data: i.data })), "qr-codes.zip")}><i class="bi bi-file-earmark-zip me-1"></i>Download ZIP</button>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        <div class="card p-3">
            {#if items.length}
                <h2 class="h5">{items.length} code{items.length === 1 ? "" : "s"} ready</h2>
                <div class="row g-2">
                    {#each items.slice(0, 24) as item (item.name)}
                        <div class="col-4 col-md-3">
                            <img src={item.preview} alt="QR code for {item.content}" class="img-fluid border rounded bg-white" title={item.content} />
                            <div class="small text-truncate text-body-secondary" title={item.content}>{item.content}</div>
                        </div>
                    {/each}
                </div>
                {#if items.length > 24}<p class="small text-body-secondary mt-2 mb-0">Showing 24 of {items.length}. The ZIP contains all of them.</p>{/if}
            {:else}
                <p class="text-body-secondary mb-0">Your QR codes appear here.</p>
            {/if}
        </div>
    </div>
</div>
