<script>
    let text = $state("https://example.com");
    let size = $state(256);
    let margin = $state(2);
    let level = $state("M");
    let dark = $state("#000000");
    let light = $state("#ffffff");

    let dataUrl = $state("");
    let svg = $state("");
    let error = $state("");

    $effect(() => {
        const options = { width: size, margin, errorCorrectionLevel: level, color: { dark, light } };
        const content = text;
        if (!content) {
            dataUrl = svg = error = "";
            return;
        }
        let cancelled = false;
        import("qrcode").then(async ({ default: QRCode }) => {
            try {
                const [png, vector] = await Promise.all([
                    QRCode.toDataURL(content, options),
                    QRCode.toString(content, { ...options, type: "svg" })
                ]);
                if (cancelled) return;
                dataUrl = png;
                svg = vector;
                error = "";
            } catch (e) {
                if (cancelled) return;
                dataUrl = svg = "";
                error = e.message.includes("too big") ? "Too much text for a QR code." : e.message;
            }
        });
        return () => (cancelled = true);
    });

    const downloadSvg = () => {
        const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "qrcode.svg";
        link.click();
        URL.revokeObjectURL(url);
    };
</script>

<svelte:head>
    <title>QR Code Generator | Mools</title>
</svelte:head>

<h1>QR Code Generator</h1>
<p class="text-body-secondary mb-3">Create a QR code for a link, text, Wi-Fi details and more.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="text" class="form-label">Content</label>
                <textarea id="text" class="form-control" rows="4" bind:value={text}></textarea>
            </div>
            <div class="mb-3">
                <label for="size" class="form-label">Size: {size}px</label>
                <input id="size" class="form-range" type="range" min="128" max="1024" step="32" bind:value={size} />
            </div>
            <div class="mb-3">
                <label for="margin" class="form-label">Margin: {margin}</label>
                <input id="margin" class="form-range" type="range" min="0" max="10" bind:value={margin} />
            </div>
            <div class="d-flex gap-3 flex-wrap">
                <div>
                    <label for="level" class="form-label">Error correction</label>
                    <select id="level" class="form-select" bind:value={level}>
                        <option value="L">Low (7%)</option>
                        <option value="M">Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                    </select>
                </div>
                <div>
                    <label for="dark" class="form-label">Foreground</label>
                    <input id="dark" class="form-control form-control-color" type="color" bind:value={dark} />
                </div>
                <div>
                    <label for="light" class="form-label">Background</label>
                    <input id="light" class="form-control form-control-color" type="color" bind:value={light} />
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        <div class="card p-3 text-center">
            {#if error}
                <div class="alert alert-danger py-2" role="alert">{error}</div>
            {:else if dataUrl}
                <img src={dataUrl} alt="QR code" class="mx-auto mb-3" style="max-width: 100%; image-rendering: pixelated;" />
                <div class="d-flex gap-2 justify-content-center">
                    <a class="btn btn-primary" href={dataUrl} download="qrcode.png"><i class="bi bi-download me-1"></i>PNG</a>
                    <button class="btn btn-outline-primary" type="button" onclick={downloadSvg}><i class="bi bi-download me-1"></i>SVG</button>
                </div>
            {:else}
                <p class="text-body-secondary mb-0">Enter some content to create a QR code.</p>
            {/if}
        </div>
    </div>
</div>
